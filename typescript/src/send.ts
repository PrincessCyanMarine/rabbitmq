import amqp from 'amqplib/callback_api';

export default (msg: string = 'Hello World!', args: string[] | string = [], exchange = 'topic_logs') => {
    if (typeof args === 'string') args = [args];
    if (args.length == 0) throw "Usage: send.js <facility>.<severity>";
    return new Promise<void>((resolve, reject) => {
        amqp.connect('amqp://localhost', (err, connection) => {
            if (err) throw err;

            connection.createChannel(function(err, channel) {
                if (err) throw err;

                var key = (args.length > 0) ? args[0] : 'anonymous.info';

                channel.assertExchange(exchange, 'topic', {
                    durable: false
                });
                channel.publish(exchange, key, Buffer.from(msg));
                console.log(" [x] Sent %s:'%s'", key, msg);
            });

            setTimeout(function() {
                connection.close();
                resolve();
            }, 500);
        });
    })
}