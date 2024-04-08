# @testplane/plugins-profiler

Plugins to profile another plugins of [Testplane](https://github.com/gemini-testing/testplane).

UI for this plugin [hermione-profiler-ui](https://github.com/gemini-testing/hermione-profiler-ui).

## Using

Installation:

```sh
npm i -D @testplane/plugins-profiler
```

### Attach

**.testplane.conf.js:**

```js
// ...
plugins: {
  "@testplane/plugins-profiler": {
    enabled: true,
    reportPath: "path_to_report" // default - "./plugins-profiler"
  }
}
```

## Development

### Tests

To run test:

```sh
npm run test
```

To run test in watch-mode:

```sh
npm run test -- --watchAll
```

### Linters

To run linters:

```sh
npm run lint
```

To fix problems:

```sh
npm run fix
```

## Release

### commit

To commit changes use commands below:

```sh
git add .
npm run commit # to commit changes in interactive mode
```

### release

```sh
npm run release
```

And follow instructions.
