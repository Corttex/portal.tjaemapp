const { Client } = require('ssh2');

const conn = new Client();

const commands = `
mkdir -p ~/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIApSo46SO4DcrIl7/OZB02Z3NU3tljLIKRscjbeJxuv6 plazabrasilia\\\\felipe.azevedo@KPHPC-MARKE3" >> ~/.ssh/authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBq6aRF4a32a+XBeN5sXA8AN4YF1aNPNEc7fWQkZFnXu" >> ~/.ssh/authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAQmiohl+7PtBC2tXwoA4sXQrKgnGd2MVe2qMs+3oVs/ coolify-generated-ssh-key" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
echo "Done setting up SSH keys"
`;

conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '2.28.26.9',
  port: 22,
  username: 'root',
  password: 'Corttex$$2o27'
});
