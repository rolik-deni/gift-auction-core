import { Command, CommandProps } from '@libs/ddd'

export class CreateUserCommand extends Command {
    readonly name?: string

    constructor(props: CommandProps<CreateUserCommand>) {
        super(props)
        this.name = props.name
    }
}
