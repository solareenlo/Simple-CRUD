import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import mongoose from 'mongoose'
import Character from './character' // モデルをimport

const app = express()
const port = process.env.PORT || 3001 // herokuの環境変数で指定されるportを使う
const dbUrl = 'mongodb://localhost/crud' // dbの名前をcrudに指定

app.use(express.static(path.join(__dirname, 'client/build')))
// body-parserを適用
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

mongoose.connect(dbUrl, { useNewUrlParser: true }, dbErr => {
  if (dbErr) throw new Error(dbErr)
  else console.log('db connected')

  // POSTリクエストに対処
  app.post('/api/characters', (request, response) => {
    // console.log('receive POST request')
    // console.log(request.body)  // 送られてきたデータをコンソール出力
    // response.status(200).send()  // クライアントにステータスコード(200:成功)とともにレスポンスを返す
    const { name, age } = request.body  // 送られてきた名前と年齢を取得
    new Character({
      name,
      age,
    }).save(err => {
      if (err) response.status(500)
      else {
        Character.find({}, (findErr, characterArray) => {
          if (findErr) response.status(500).send()
          else response.status(200).send(characterArray)
        })
      }
    })
  })

  app.get('/api/characters', (request, response) => {
    Character.find({}, (err, characterArray) => {  // 取得したドキュメントをクライアント側と同じくcharacterArrayと命名
      if (err) response.status(500).send()
      else response.status(200).send(characterArray)  // characterArrayをレスポンスとして送り返す
    })
  })

  app.put('/api/characters', (request, response) => {
    const { id } = request.body  // updateするキャラクターのidをリクエストから取得
    Character.findByIdAndUpdate(id, { $inc: {"age": 1} }, err => {
      if (err) response.status(500).send()
      else {  // updateに成功した場合、すべてのデータをあらためてfindしてクライアントに送る
        Character.find({}, (findErr, characterArray) => {
          if (findErr) response.status(500).send()
          else response.status(200).send(characterArray)
        })
      }
    })
  })

  app.delete('/api/characters', (request, response) => {
    const { id } = request.body
    Character.findByIdAndRemove(id, err => {
      if (err) response.status(500).send()
      else {
        Character.find({}, (findErr, characterArray) => {
          if (findErr) response.status(500).send()
          else response.status(200).send(characterArray)
        })
      }
    })
  })

  // MongoDBに接続してからサーバーを立てるために
  // app.listen()をmongoose.connect()の中に移動
  app.listen(port, err => { // http://localhost:3001にサーバーがたつ
    if (err) throw new Error(err)
    else console.log(`http://localhost:${port} で動いています.`)
  })
})
