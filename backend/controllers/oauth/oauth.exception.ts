import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { CustomRequest } from '../../models/request.model'
import { User } from '../../models/user.model'

export class OauthException extends HttpException {
    constructor(message: string) {
        super({ message, status: HttpStatus.BAD_REQUEST }, HttpStatus.BAD_REQUEST)
    }
}

@Catch(OauthException) // Catch the custom exception
export class OauthExceptionFilter implements ExceptionFilter {
    async catch(exception: OauthException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const request = ctx.getRequest<CustomRequest>()
        const session = request.session
        const userID = session['userID']
        let redirectUrl: string
        if (userID) {
            const user = await User.findOne({ _id: userID })
            redirectUrl = `/users/${user.username}`
        } else {
            redirectUrl = `/login`
        }
        request.session.destroy(null)
        response.redirect(
            `http://${process.env.CLIENT_HOST}/login?status=fail&message=${exception.message}&redirectUrl=${redirectUrl}`,
        )
    }
}
