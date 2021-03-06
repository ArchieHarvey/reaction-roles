import { Command, Inhibitor, Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReloadCommand extends Command {
	public constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'owner',
			ownerOnly: true,
			description: {
				content: 'Reloads a module.',
				usage: '<module> [type:]',
			},
		});
	}

	public *args() {
		const type = yield {
			match: 'option',
			flag: ['type:'],
			type: [
				['command', 'c'],
				['inhibitor', 'i'],
				['listener', 'l'],
			],
			default: 'command',
		};

		const mod = yield {
			type: (msg: Message, phrase: string) => {
				if (!phrase) return null;

				const types: { [key: string]: string } = {
					command: 'commandAlias',
					inhibitor: 'inhibitor',
					listener: 'listener',
				};

				const resolver = this.handler.resolver.type(types[type]!);

				return resolver(msg, phrase);
			},
		};

		return { type, mod };
	}

	public async exec(
		msg: Message,
		{ type, mod }: { type: any; mod: Command | Inhibitor | Listener },
	): Promise<Message | Message[] | void> {
		if (!mod) {
			return msg.util?.reply(`Invalid ${type} ${type === 'command' ? 'alias' : 'ID'} specified to reload.`);
		}

		try {
			mod.reload();
			return msg.util?.reply(`Sucessfully reloaded ${type} \`${mod.id}\`.`);
		} catch (err) {
			this.client.logger.error(`Error occured reloading ${type} ${mod.id}`);
			this.client.logger.error(err);
			return msg.util?.reply(`Failed to reload ${type} \`${mod.id}\`.`);
		}
	}
}
