// commands/message/math.js

const math = require("mathjs");

function mathEvaluate(expression) {
    if (!expression) return null;
    try {
        const formattedExpression = expression
            .replace(/\*\*/g, "^")
            .replace(/×/g, "*")
            .replace(/÷/g, "/");
        return math.evaluate(formattedExpression);
    } catch (error) {
        console.error("Math.js 評価エラー:", error);
        return null;
    }
}

module.exports = {
    name: 'math',
    description: '数式を計算・評価します。詳しくは[ここ(外部リンク)](https://mathjs.org/)',
    aliases: ['calc'],

    async execute(client, message, args) {
        const expression = args.join(' ').trim();

        if (!expression) {
            return message.reply({ content: '計算したい数式を入力してください。', allowedMentions: { repliedUser: false } });
        }

        const result = mathEvaluate(expression);

        if (result === null) {
            return message.reply({ content: "無効な数式です", allowedMentions: { repliedUser: false } });
        }

        try {
            await message.reply({ content: String(result), allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error(error);
            await message.react("❌")
        }
    },
};