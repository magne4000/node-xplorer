node-xplorer
============

Web browser file explorer based on websockets. It is based on PAM for user authentication.
When a user log in, the core starts a new session : it creates a subprocess with the uid and gid of the user, chroot the process in this user's home, and all of his actions are 'jailed' (executed) by this subprocess.
