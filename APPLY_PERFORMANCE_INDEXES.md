# Quick Guide: Apply Performance Indexes

## Step 1: Locate the SQL File
The database index script is located at:
```
performance_indexes.sql
```
(in your project root folder)

## Step 2: Apply Using Supabase Dashboard

1. **Open the SQL file**
   - Open `performance_indexes.sql` in any text editor
   - Select all and copy (Ctrl+A, Ctrl+C)

2. **Go to Supabase Dashboard**
   - Log into your Supabase account
   - Select your HMS project
   - Click on "SQL Editor" in the left sidebar

3. **Run the Script**
   - Click "New Query"
   - Paste the entire SQL script
   - Click "Run" (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

4. **Verify Success**
   - You should see "Success. No rows returned"
   - This means all indexes were created successfully

## Step 3: Verify Indexes Were Created (Optional)

Run this verification query in the SQL Editor:
```sql
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

You should see approximately 50+ indexes with names starting with `idx_`.

## What This Does

Creates database indexes on:
- Patient searches (name, ID, contact)
- Registration queries (patient history, doctor reports)
- Service modules (injections, vaccinations, procedures)
- Billing and invoice lookups
- Date range filtering

## Expected Results

After applying indexes:
- Patient searches: 10-100x faster
- Patient history: 5-10x faster
- Date range reports: 10-20x faster
- Invoice searches: 10-20x faster
- Overall system feels much more responsive

## Troubleshooting

**If you see "already exists" errors:**
- This is fine! It means some indexes already exist
- The script uses `IF NOT EXISTS` so it's safe to run multiple times

**If you see permission errors:**
- Make sure you're logged in as the project owner
- Or use the service role key

**If you see table not found errors:**
- Verify you're connected to the correct Supabase project
- Check that your migrations have been applied

## Alternative: Using Supabase CLI

If you prefer using the CLI:

```bash
# Move file to migrations folder
mv performance_indexes.sql supabase/migrations/20250926000000_create_performance_indexes.sql

# Apply migration
supabase db push
```

## Need Help?

If you encounter any issues:
1. Check the SQL Editor error message
2. Verify you're in the correct Supabase project
3. Ensure all previous migrations have been applied
4. Contact support with the specific error message
