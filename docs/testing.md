# Testing

The Baukasten-Astro project incorporates testing to ensure code quality and maintainability. The primary testing framework used is Vitest.

## Vitest (e.g., v3.0.8+)

- **Fast Unit Testing**: Vitest is a blazing fast unit test framework powered by Vite. It's designed to be compatible with Vite-based projects like Astro.
- **Configuration (`vitest.config.ts`)**: Test-specific configurations for Vitest are defined in `vitest.config.ts`. This can include setting up test environments, globals, and coverage options.
- **Test Files**: Tests are typically located in `__tests__` subdirectories alongside the components or modules they are testing (e.g., `src/components/__tests__/MyComponent.test.ts`) or in a dedicated test directory.
- **Component Testing**: Vitest can be used to test Astro components, utility functions, and other JavaScript/TypeScript modules.
  - For Astro components, testing might involve rendering the component and asserting its output or behavior. Libraries like `@testing-library/astro` can be helpful for this.

## Running Tests

- **`npm test`**: The `package.json` file usually includes a script to run tests:
  ```json
  "scripts": {
    "test": "vitest"
    // other scripts
  }
  ```
  Executing `npm test` in the terminal will run all tests defined in the project.
- **Watch Mode**: Vitest supports a watch mode (`vitest --watch`) that automatically re-runs tests when files change, which is useful during development.

## Coverage

- Vitest can generate test coverage reports (often using `c8` or `istanbul`) to show what percentage of the codebase is covered by tests. This helps identify untested parts of the application.

## Scope of Testing

- **Unit Tests**: Focus on testing individual components, functions, or modules in isolation.
- **Integration Tests**: While Vitest is primarily for unit tests, it can be used for some forms of integration testing, especially for how different JavaScript modules interact.
- **End-to-End (E2E) Tests**: For full E2E testing (simulating user interactions in a browser), other tools like Playwright or Cypress might be considered, though this project primarily focuses on Vitest for unit/component testing.

## Clean Command

- **`npm run clean`**: The project may also include a `clean` script in `package.json` (e.g., `"clean": "rm -rf public/content/* .astro/*"`). This script is not for testing code directly but is useful for clearing cached content or build artifacts (like the `astro-kirby-sync` state file) to ensure a fresh build or sync, which can be helpful during development or troubleshooting.

Maintaining a good test suite is crucial for long-term project health, making refactoring safer and catching regressions early.
