import amqp, { Message } from 'amqplib/callback_api';

export default (args: string[] | string, exchange = 'topic_logs', callback?: (content: string, msg: Message) => void) => {
    if (typeof args === 'string') args = [args];
    if (args.length == 0) throw "Usage: receive_logs_topic.js <facility>.<severity>";
    return new Promise<void>((resolve) => {
        amqp.connect('amqp://localhost', (err, connection) => {
            if (err) throw err;
            connection.createChannel((err, channel) => {
                if (err) throw err;

                channel.assertExchange(exchange, 'topic', { durable: false });

                channel.assertQueue('', { exclusive: true }, (err, q) => {
                    if (err) throw err;

                    console.log(' [*] Waiting for logs. To exit press CTRL+C');

                    for (let key of args) channel.bindQueue(q.queue, exchange, key);

                    channel.consume(q.queue, (msg) => {
                        if (!msg) return;
                        console.log(msg);
                        console.log(" [x] Received %s:'%s'", msg.fields.routingKey, msg.content.toString());
                        callback?.(msg.content.toString(), msg);
                    }, {
                        noAck: true
                    });
                    resolve();
                });
            });
        });
    })
}