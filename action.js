const Jira = require("./common/net/Jira");
module.exports = class {
	constructor({ githubEvent, argv, config }) {
		this.Jira = new Jira({
			baseUrl: config.baseUrl,
			token: config.token,
			email: config.email,
		});

		this.config = config;
		this.argv = argv;
		this.githubEvent = githubEvent;
	}

	async execute() {
		const issueId = this.argv.issue || this.config.issue || null;
		const { update, comment, type, panelComment, attachment } = this.argv;

		const panelTypes = [
			{ type: "info", color: "#deebff" },
			{ type: "note", color: "#eae6ff" },
			{ type: "success", color: "#e3fcef" },
			{ type: "warning", color: "#fffae6" },
			{ type: "error", color: "#ffebe6" },
		];

		const found = update && (await this.Jira.getComment(issueId, update));

		const panelData =
			panelComment && type
				? "{panel:bgColor=" +
				  panelTypes.filter((p) => p.type === type)[0].color +
				  "}" +
				  panelComment +
				  "{panel}"
				: "";
		const attachmentData = attachment
			? "!" + attachment + "|width=200,height=200!"
			: "";
		const commentData = comment ? comment : "";

		if (found) {
			console.log(`Updating comment ${update} on ${issueId}`);
			const commentUpdated = await this.Jira.updateComment(
				issueId,
				update,
				`{
					"body": "${[panelData, attachmentData, commentData].join(' ')}"
				}`
			);
			console.log({ id: commentUpdated.id });
			return { id: commentUpdated.id };
		} else {
			console.log(`Adding comment to ${issueId}`);
			const commentPosted = await this.Jira.addComment(
				issueId,
				`{
					"body": "${[panelData, attachmentData, commentData].join(' ')}"
				}`
			);
			console.log({ id: commentPosted.id });
			return { id: commentPosted.id };
		}
	}
};
