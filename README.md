## codespaceで開けるようにする
repositoryのsettingにてTemplate repositoryにチェックを付ける
repositoryのcodeにてUse this templateからOpen in a codespace

## 環境構築

### codespaceにangular CLIをinstallする
下記のコマンドでインストール

```
$ npm install -g @angular/cli
```

### NODEにOPTION追加

普通にアプリを起動しようとすると下記のエラーが出る

'ERR_OSSL_EVP_UNSUPPORTED'

対策として下記の環境変数を設定する

```
$ export NODE_OPTIONS=--openssl-legacy-provider
```

### MySQL環境の構築手順
イメージの取得
```
$ docker image pull mysql:latest
```
ボリュームの作成
```
$ docker volume create test
```
コンテナの起動
```
docker container start my-server
```

#### コンテナの作成方法
```
$ docker container run --name test-mysql -v test:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=hogehoge -d mysql:latest
```
※「–name」のあとにコンテナ名（「test-mysql」）を指定しています。
※「-v」で先ほど作成したボリューム（「test」）を、Data Volumeとして指定しています。
※「-e」でパスワードを指定しています。上記例では「hogehoge」の部分です。
　パスワードは任意で変更してください。

### アプリの起動
```
$ ng serve --open
```

### 参考記事
DockerでMySQL用コンテナの作成＋データの永続化
https://www.kagoya.jp/howto/cloud/container/dockermysql/