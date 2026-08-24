# Secure LMS Deployment Management

This directory documents the production deployment, release tracking, and rollback strategy for the Secure LMS MVP.

## Production Deployment

GitHub
  |
  v
GitHub Actions
  |
  +-- CI validation
  +-- Docker build
  +-- SHA-based image tagging
  +-- Push images to Amazon ECR
  |
  v
Amazon ECR
  |
  v
AWS Systems Manager
  |
  v
EC2
  |
  +-- Nginx
  +-- Frontend
  +-- Backend
  +-- PostgreSQL

## Release Identification

Every production deployment is identified by the Git commit SHA.

Example:

f08ea32f9832c9c7f6ffc8748dda573cc76882c0

The same SHA is used for the backend and frontend Docker images.

This provides deterministic deployment and rollback capability.

## Deployment State

Runtime deployment state will be maintained on EC2 under:

/home/ubuntu/secure-lms-mvp/.deployment/

The runtime state will contain:

- current-release
- previous-release
- deployment-history.log

The .deployment directory must not be committed to Git.

## Deployment Audit

Each deployment should record:

- Git commit SHA
- Previous release SHA
- Backend image
- Frontend image
- GitHub Actions run ID
- AWS SSM command ID
- Deployment timestamp
- Deployment status
- Health-check result
- Disk usage before deployment
- Disk usage after deployment

## Rollback

Rollback uses an existing SHA-tagged Docker image.

Example:

Current release:
abc1234

Previous known-good release:
f08ea32

If abc1234 needs to be rolled back, the deployment system restores f08ea32.

The rollback process must:

1. Pull the specified backend SHA image.
2. Pull the specified frontend SHA image.
3. Start the application using Docker Compose.
4. Perform the health check.
5. Record the rollback result.

## Database Rollback

Application rollback and database rollback are separate concerns.

Reverting application containers does not automatically revert Prisma database migrations.

Database migrations must therefore be considered separately when planning rollback.

## Deployment Safety

Production deployment must:

- Use immutable Git SHA image tags.
- Use GitHub Actions OIDC for AWS authentication.
- Deploy through AWS Systems Manager.
- Perform a post-deployment health check.
- Record deployment state.
- Preserve the previous release.
- Monitor disk utilisation.
