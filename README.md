# hermione-plugins-profiler

Plugins to profile another plugins of [hermione](https://github.com/gemini-testing/hermione).

UI for this plugin [hermione-profiler-ui](https://github.com/gemini-testing/hermione-profiler-ui).

## Using

Installation:

```sh
npm i -S hermione-plugins-profiler
```

### Attach

**.hermione.conf.js:**

```js
// ...
plugins: {
  "hermione-plugins-profiler": {
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
