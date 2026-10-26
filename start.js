const net = require('node:net');
const { spawn } = require('node:child_process');

const services = [
  ['backend', 4000, ['--prefix', 'backend', 'start']],
  ['frontend', 5173, ['--prefix', 'frontend', 'run', 'dev', '--', '--host', 'localhost']]
];

const processes = [];

function portInUse(port) {
  const canBind = host => new Promise(resolve => {
    const server = net.createServer();
    server.once('error', error => resolve(error.code === 'EADDRINUSE'));
    server.once('listening', () => server.close(() => resolve(false)));
    server.listen({ port, host });
  });

  return canBind('127.0.0.1').then(inUse =>
    inUse ? true : canBind('::')
  );
}

async function start() {
  for (const [name, port, args] of services) {
    if (await portInUse(port)) {
      console.log(`${name} ya está activo en el puerto ${port}; se reutiliza la instancia existente.`);
      continue;
    }

    const child = spawn('npm', args, {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
      windowsHide: false
    });

    child.on('exit', (code, signal) => {
      if (code !== 0 && signal !== 'SIGTERM') {
        console.error(`${name} terminó con código ${code ?? signal}.`);
      }
    });

    processes.push(child);
  }
}

function shutdown() {
  for (const child of processes) {
    if (!child.killed) child.kill('SIGTERM');
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);

start().catch(error => {
  console.error('No fue posible iniciar los servicios:', error);
  process.exitCode = 1;
});
