# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Loy Payway, **please do not open a public issue**.

Instead, report it privately by emailing:

> **security@loypayway.com**

Or use [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) on this repository.

### What to Include

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fix (optional)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Fix or mitigation**: Depends on severity, but we aim for under 30 days for critical issues

### Scope

The following are in scope:

- API authentication and authorization bypasses
- Webhook signature forgery or bypass
- SQL injection or data exposure
- Secrets leaking in logs or responses
- Denial of service via rate limit bypass

The following are **out of scope**:

- Issues in demo mode only (demo mode is explicitly non-production)
- Vulnerabilities in third-party dependencies (report these upstream)
- Social engineering attacks

## Security Best Practices for Deployers

1. **Never commit `.env` files** — Use `.env.example` as a template
2. **Rotate secrets regularly** — API keys, JWT secrets, Bakong tokens
3. **Use HTTPS** in any deployed environment
4. **Disable demo mode** in production — Set `PAYWAY_ALLOW_DEMO=false`
5. **Restrict CORS** — The default allows all origins; tighten in production
6. **Use a proper database** — In-memory storage is for development only
7. **Verify webhook signatures** — Always validate `X-PayWay-Signature` headers
8. **Set strong JWT secrets** — Use `openssl rand -base64 32` to generate
