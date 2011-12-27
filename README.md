node-xplorer
============

Web browser file explorer based on websockets. Its particularity is that it is based on PAM for user authentication.
When a user log in, the core creat a subprocess with the uid and gid of the logged user, and all of his actions are 'jailed' (executed) by this subprocess.
