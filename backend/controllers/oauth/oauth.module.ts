import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { GithubStrategy, GoogleStrategy } from './oauth.service'
import { MongooseModule } from '@nestjs/mongoose'
import { OAuthSchema, User } from '../../models/user.model'

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'github' }),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
        MongooseModule.forFeature([{ name: 'OAuth', schema: OAuthSchema }]),
    ],
    providers: [GithubStrategy, GoogleStrategy],
})
export class OauthModule {}
