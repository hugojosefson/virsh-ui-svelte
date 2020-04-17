# virsh-ui-svelte

Web app for managing virtual machines.

## Common prerequisite

- [libvirt](https://libvirt.org/)

### Additionally required for running/building via Docker

- [Docker Engine](https://docs.docker.com/get-docker/)

### Additionally required for running/building without Docker

- Node.js@>=13, preferably installed via [nvm](https://github.com/nvm-sh/nvm)
- [`virsh`](https://libvirt.org/manpages/virsh.html) command-line tool

## Running with Docker

The only thing from this repo you need to run the service in Docker, is the
script
[docker-run](https://github.com/hugojosefson/virsh-ui-svelte/blob/master/docker-run).

`./docker-run` accepts the following optional environment variables:

| Name           | Default value                   | Description                                 |
| :------------- | :------------------------------ | :------------------------------------------ |
| `PORT`         | `3000`                          | The HTTP port to listen on.                 |
| `LIBVIRT_SOCK` | `/var/run/libvirt/libvirt-sock` | Socket file for communication with libvirt. |

### Usage examples

```bash
./docker-run
```

```bash
PORT=80 ./docker-run
```

## Building with Docker

Only needed if you have made changes to the source code. Otherwise
`./docker-run` automatically downloads the latest Docker image for
[`hugojosefson/virsh-ui-svelte` from Docker Hub](https://hub.docker.com/r/hugojosefson/virsh-ui-svelte).

```bash
./docker-build
```

---

Based on
[hugojosefson/sapper-template-rollup](https://github.com/hugojosefson/sapper-template-rollup).
