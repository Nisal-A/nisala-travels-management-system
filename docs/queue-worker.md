# Queue Worker Setup

For production, it is recommended to run the queue worker using a process monitor like Supervisor so it automatically restarts if it fails.

## Running the Queue Worker Locally

For local development or testing, you can simply run:

```bash
php artisan queue:work --tries=3 --backoff=30,120,600
```

## Supervisor Configuration (Production)

Create a configuration file in `/etc/supervisor/conf.d/nisalatravels-worker.conf`:

```ini
[program:nisalatravels-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/nisala-travels-management-system/artisan queue:work database --tries=3 --backoff=30,120,600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/nisala-travels-management-system/storage/logs/worker.log
stopwaitsecs=3600
```

After creating the configuration file, update Supervisor configuration and start the process:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start nisalatravels-worker:*
```

## Scheduled Tasks

To run scheduled tasks like the trip reminders, add this cron entry:

```bash
* * * * * cd /path/to/nisala-travels-management-system && php artisan schedule:run >> /dev/null 2>&1
```
