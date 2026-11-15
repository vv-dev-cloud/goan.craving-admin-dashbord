# Agav project instructions — Goan Craving Admin Dashboard

## Project role
This repository provides platform-wide administration and analytics for Goan Craving customers, sellers, restaurants, products, orders, employees, and delivery agents.

## Non-negotiable safety rules
- Begin with a read-only audit of the existing UI, server, models, data access, and authentication.
- Preserve existing admin access behavior unless explicitly tasked to change it.
- Never expose or commit .env values, database credentials, session secrets, or personal data.
- Never delete production data or make destructive schema changes.
- Use a feature branch. Never push to main, force-push, merge, or deploy without human approval.
- Require explicit approval before account suspension, payout changes, destructive operations, or permission changes.

## Data and authorization rules
- Admin analytics must use authoritative data from the appropriate system/repository, not guessed or duplicated totals.
- Clearly distinguish gross order value, completed sales, delivery charges, discounts, refunds, COD collections, online payments, commissions, and seller payouts.
- Exclude cancelled, failed, or unpaid orders from completed-sales metrics as appropriate.
- Use stable customerId, sellerId, restaurantId, productId, orderId, employeeId, and agentId identifiers across the ecosystem.
- Restrict sensitive customer, employee, payment, and agent-location information to authorized admin roles.
- Every administrative mutation must record actor, timestamp, action, target record, and reason where appropriate.
- Prefer read-only reporting APIs and least-privilege service credentials.

## Admin dashboard roadmap
1. Audit current admin pages, server routes, models, and data sources.
2. Build overview metrics for customers, sellers, restaurants, products, orders, employees, and agents.
3. Add customer and seller management with appropriate verification and account controls.
4. Add employee and delivery-agent management with role/permission controls.
5. Add order monitoring and operational reporting.
6. Add financial reports based on verified payment and refund records.
7. Add audit logs, platform settings, and report exports.
8. Integrate with the other repositories through documented, authenticated APIs.

## Required workflow for each task
1. Inspect data sources and existing permissions before editing.
2. Define metric formulas, API contracts, and acceptance criteria.
3. Implement the smallest compatible change.
4. Test access control, metric correctness, empty states, pagination, and error handling.
5. Run available checks and inspect git diff.
6. Report changed files, test evidence, data assumptions, and security risks.
7. Leave changes on the feature branch for human review; do not merge or deploy.
