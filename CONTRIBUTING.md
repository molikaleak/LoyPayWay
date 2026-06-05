# Contributing to Loy Payway

Thank you for your interest in contributing to Loy Payway! We welcome contributions from everyone.

This document provides guidelines and workflows to help you make contributions to the codebase, documentation, or issue tracker.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to **conduct@loypayway.com**.

---

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. Search the existing issues to see if it has already been reported.
2. If it's a security vulnerability, please follow our [Security Policy](SECURITY.md) instead of creating a public issue.

When filing an issue, please include:
- A clear description of the bug
- Step-by-step instructions to reproduce the issue
- Expected vs. actual behavior
- Relevant environment info (Node version, OS, etc.)
- Logs or screenshots if applicable

### Suggesting Enhancements

We are always open to ideas! When suggesting a feature:
- Explain **why** you want this feature and the problem it solves.
- Describe how it should work.
- Provide examples or mockups if applicable.

### Submitting Pull Requests

1. **Fork** the repository and create your branch from `main`.
2. Ensure your code follows the style and lint guidelines.
3. Write/update unit tests for your changes.
4. Run all verification steps (see [Verification](#verification) below).
5. Document any new environment variables in `.env.example` and update the documentation if needed.
6. Open a Pull Request with a clear description of your changes.

---

## Local Development Setup

### Requirements

- Node.js 20 or newer
- npm 10 or newer

### Setup

```bash
# Clone the repository
git clone https://github.com/molikaleak/LoyPayWay.git
cd LoyPayWay

# Copy the environment template
cp .env.example .env

# Install dependencies for all packages in the workspace
npm install
```

### Running Locally

To run the API server in development mode (with hot-reload):
```bash
npm run dev:server
```

To run the Next.js merchant dashboard:
```bash
npm run dev:dashboard
```

By default, the server runs on `http://localhost:3000` and the dashboard on `http://localhost:3001`.

---

## Monorepo Structure

This project uses npm workspaces to manage multiple packages:

- `packages/core`: Core shared SDK wrappers, polling loop logic, and webhook/Telegram dispatch.
- `packages/server`: Express API server exposing endpoints for merchants and QR generation.
- `packages/dashboard`: Next.js frontend console for viewing transactions, analytics, and settings.

To run scripts inside a specific package, use the `-w` (workspace) flag:
```bash
# Example: Run lint or run dev in core
npm run test -w @loy-payway/core
```

---

## Verification

Before opening a pull request, you **must** run the following checks locally:

### 1. Run Tests
Ensure all unit tests in the core package pass:
```bash
npm test
```

### 2. Verify Dashboard Build
Ensure the Next.js dashboard compiles successfully for production:
```bash
npm run build:dashboard
```

### 3. Check for Secrets
Double check that you have not accidentally committed any secrets (tokens, database credentials, passwords) to your git branch.

---

## Git Commit Guidelines

We recommend clean, descriptive commit messages. Try to follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new user-facing features
- `fix:` for bug fixes
- `docs:` for documentation updates
- `style:` for code formatting changes (no functional impact)
- `refactor:` for code restructuring (no new features/bug fixes)
- `test:` for adding/updating tests
- `chore:` for build system, dependencies, or repository tasks
