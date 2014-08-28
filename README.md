[T3 Javascript Framework](https://confluence.inside-box.net/display/ETO/T3+JavaScript+Framework)
================================================================================================

[See Documentation](https://gitenterprise.inside-box.net/pages/Box/T3/)

Building T3
-----------

Clone the repo:

```bash
git clone https://gitenterprise.inside-box.net/Box/T3.git
```

Install the [grunt-cli](http://gruntjs.com/getting-started#installing-the-cli) globally:

```bash
sudo npm install -g grunt-cli
```

Install dependencies:

```bash
cd T3 && npm install
```

Build concatenated file (dist/t3-\<version\>.js) and docs (doc/index.html):

```bash
grunt build
```

Developing
----------

Lint and run unit tests:

```bash
grunt
```

