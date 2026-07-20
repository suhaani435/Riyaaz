# Dependency security

## Policy

Dependency audits are run whenever the web dependency lockfile changes and in
continuous integration once CI is introduced. Critical and high-severity
production findings block a release until remediated or an explicitly accepted,
time-bounded exception is recorded.

Development-tool vulnerabilities are remediated promptly because CI runners
and developer machines are part of the delivery supply chain.

## Current upstream limitation

As of 2026-07-21, npm audit reports a moderate PostCSS advisory through the
bundled PostCSS version in Next.js 16.2.10. The audit service offers only a
downgrade to Next.js 9 as a fix, which is neither compatible nor an acceptable
security response. npm does not apply an override to this exact bundled
dependency.

The affected dependency is used in the build toolchain. RIYAAZ does not process
untrusted CSS at this stage, reducing the practical exposure, but this is not a
release waiver. The advisory must be reassessed on every Next.js upgrade, and
no production release may treat the audit report as resolved without an
upstream-compatible fix or a recorded security exception.
