# Database Backup, Disaster Recovery & Restoration Runbook

This guide specifies the operational backup schedules, manual snapshot procedures, and disaster recovery runbooks for the LMS MySQL database.

---

## 1. Backup Strategies & Cadence

| Tier | Backup Type | Frequency | Retention Period | Storage Location |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | Render Automated Snapshots | Daily at 00:00 UTC | 7 Days (Standard) / 30 Days (Pro) | Render Managed Storage |
| **Tier 2** | Logical SQL Dump (`mysqldump`) | Weekly / Pre-Migration | 90 Days | Encrypted AWS S3 / Cloudflare R2 |
| **Tier 3** | Point-In-Time Binary Logs | Continuous | 7 Days | Render Managed WAL Storage |

---

## 2. Manual Backup Execution (`mysqldump`)

Before performing major schema migrations, run a manual logical dump:

```bash
# Export compressed MySQL dump with transactional consistency
mysqldump -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --databases lms_production_db | gzip > lms_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 3. Database Restoration Runbook

In the event of accidental data deletion or hardware failure:

### Step 3.1: Stop Web Service Traffic
Temporarily scale the web service down to 0 workers in Render dashboard or enable maintenance mode to prevent active writes.

### Step 3.2: Restore from Dump File
```bash
# Decompress and import SQL script into target database
gunzip < lms_backup_YYYYMMDD_HHMMSS.sql.gz | mysql -h <DB_HOST> -u <DB_USER> -p<DB_PASSWORD> lms_production_db
```

### Step 3.3: Re-apply Alembic Head
Ensure the restored database aligns with the current application revision:
```bash
alembic upgrade head
```

### Step 3.4: Restart Web Service
Scale web workers back to active count and verify the `/health` endpoint.

---

## 4. Alembic Migration Rollback Runbook

If a newly deployed migration produces unexpected runtime schema errors:

```bash
# Revert single most recent migration
alembic downgrade -1

# Or revert to a specific tagged revision
alembic downgrade <revision_id>
```
