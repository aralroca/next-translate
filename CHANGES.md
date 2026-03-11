# Changes and Fixes for Next Translate Turbopack Support

This document summarizes the changes made to the `next-translate-plugin` to resolve translation issues and crashes when using Next.js with Turbopack, specifically addressing the `basic`, `complex`, and `without-loader` examples.

## Key Fixes

### 1. Absolute Path Correction in `index.ts`

Fixed a bug in the plugin's entry point where an absolute path to the `_app` file was being incorrectly concatenated with the `basePath`, resulting in a `MODULE_NOT_FOUND` error during the file parsing stage.

- **Change**: Updated the `parseFile` call to use `path.relative(basePath, path.join(pagesPath, app))`.

### 2. Turbopack Compatibility for `loadLocaleFrom`

Resolved the "Cannot find module as expression is too dynamic" error that occurred when Turbopack encountered the plugin's default `import()` template for loading locales.

- **Detection**: Added logic in `index.ts` to detect if the user's `i18n.js` configuration includes a custom `loadLocaleFrom` function.
- **Flag Propagation**: Introduced a `hasLoadLocaleFrom` boolean flag passed from the plugin options to the loader and subsequently to all template generators (`templateWithHoc`, `templateWithLoader`, `templateAppDir`).
- **Conditional Loading**: Modified `addLoadLocalesFrom` in `utils.ts` to return an empty `loadLocaleFrom` definition if the user provides their own, preventing the injection of the problematic dynamic import template.

### 3. Server-Side Config Access for `getT` and `loadNamespaces`

Fixed an issue where server-side functions like `getServerSideProps` and `getStaticProps` couldn't access the i18n configuration, causing translation failures in the Pages router.

- **Mechanism**: Updated `templateWithLoader.ts` to explicitly set `global.i18nConfig` before executing the original page loader.
- **Result**: Ensures that `getT` and `loadNamespaces` can retrieve the configuration even when running in the server environment without a request context.

### 4. Build Process and Parameter Robustness

- **Build Script**: Updated `build-packages.js` to use `path.join(__dirname, ...)` for all filesystem operations, making the build process more robust across different working directories and monorepo structures.
- **Default App JS**: Fixed the `loader.ts` to correctly pass the `hasLoadLocaleFrom` flag to the `getDefaultAppJs` utility, ensuring the generated `_app` wrapper respects the custom loader configuration.

## Verified Examples

- **Example: Basic**: Dynamic routes (e.g., `/en/more-examples/dynamicroute/example`) now correctly load translations via `getServerSideProps` without crashing.
- **Example: Complex**: Custom interpolation and nested translation structures function correctly.
- **Example: Without-Loader**: Manual `loadNamespaces` calls behave as expected without interfering with the plugin's transformation logic.
- **Example: With-App-Directory**: Continued support for the App Router with Turbopack.
