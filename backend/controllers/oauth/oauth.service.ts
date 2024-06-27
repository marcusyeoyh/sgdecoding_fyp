import { Inject, Injectable, Logger } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy as GithubPassport } from 'passport-github2'
import { Strategy as GooglePassport } from 'passport-google-oauth20'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { OAuth, OAuthModel, User, UserModel } from 'src/users/users.model'
import { OauthException } from './oauth.exception'
import { CustomRequest } from 'src/common/request/request.model'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class GithubStrategy extends PassportStrategy(GithubPassport, 'github') {
    private readonly logger = new Logger(GithubStrategy.name)

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('OAuth') private readonly oAuthModel: Model<OAuth>,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {
        super({
            clientID: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK,
            passReqToCallback: true,
        })
    }

    async validate(
        request: CustomRequest,
        accessToken: string,
        refreshToken: string,
        profile: any,
    ) {
        const session = request.session
        const userID = session ? session['userID'] : null
        let oAuthEntry = await this.oAuthModel.findOne({
            oAuthProvider: 'github',
            oAuthID: profile._json.id,
        })

        // logged in
        if (userID) {
            // check if existing entry's user is the same as the current user making the request
            if (oAuthEntry) {
                if (oAuthEntry.userID === userID) {
                    const user = await this.userModel.findById(userID)
                    return { user: user }
                } else {
                    const message = 'OAuth account already associated with another user.'
                    throw new OauthException(message)
                }
            } else {
                const user = await this.userModel.findById(userID)
                const newOAuthEntry = new OAuthModel({
                    oAuthProvider: 'github',
                    oAuthID: profile._json.id,
                    userID: userID,
                })
                await this.cacheService.del('oauth-userID-' + userID)
                this.logger.log('OAuth link flushed from cache.')
                await newOAuthEntry.save()
                return { user: user }
            }
        }
        // not logged in
        else {
            if (oAuthEntry) {
                const user = await this.userModel.findById(oAuthEntry.userID)
                return { user: user }
            } else {
                const user = await this.userModel.findOne({ email: profile._json.email })
                if (user) {
                    const message =
                        'Email already exist. Consider logging into your existing account to enable SSO.'
                    throw new OauthException(message)
                }
                const newUser = new UserModel({
                    username: 'Github-' + profile._json.id,
                    name: profile._json.name ? profile._json.name : 'Github-' + profile._json.id,
                    email: profile._json.email ? profile._json.email : 'Github-' + profile._json.id,
                    department: profile._json.company
                        ? profile._json.company
                        : 'Github-' + profile._json.id,
                    validated: false,
                })
                await newUser.save()
                const newOAuthEntry = new OAuthModel({
                    oAuthID: profile._json.id,
                    oAuthProvider: 'github',
                    userID: newUser.id,
                })
                await newOAuthEntry.save()
                return { user: newUser }
            }
        }
    }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(GooglePassport, 'google') {
    private readonly logger = new Logger(GithubStrategy.name)

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        @InjectModel('OAuth') private readonly oAuthModel: Model<OAuth>,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) {
        super({
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK,
            scope: ['profile', 'email'],
            passReqToCallback: true,
        })
    }

    async validate(
        request: CustomRequest,
        accessToken: string,
        refreshToken: string,
        profile: any,
    ) {
        const session = request.session
        const userID = session ? session['userID'] : null
        let oAuthEntry = await this.oAuthModel.findOne({
            oAuthProvider: 'google',
            oAuthID: profile._json.sub,
        })

        // logged in
        if (userID) {
            // check if existing entry's user is the same as the current user making the request
            if (oAuthEntry) {
                if (oAuthEntry.userID === userID) {
                    const user = await this.userModel.findById(userID)
                    return { user: user }
                } else {
                    const message = 'OAuth account already associated with another user.'
                    throw new OauthException(message)
                }
            } else {
                const user = await this.userModel.findById(userID)
                const newOAuthEntry = new OAuthModel({
                    oAuthProvider: 'google',
                    oAuthID: profile._json.sub,
                    userID: userID,
                })
                await newOAuthEntry.save()
                await this.cacheService.del('oauth-userID-' + userID)
                this.logger.log('OAuth link flushed from cache.')
                return { user: user }
            }
        }
        // not logged in
        else {
            if (oAuthEntry) {
                const user = await this.userModel.findById(oAuthEntry.userID)
                return { user: user }
            } else {
                const user = await this.userModel.findOne({ email: profile._json.email })
                if (user) {
                    const message =
                        'Email already exist. Consider logging into your existing account to enable SSO.'
                    throw new OauthException(message)
                }
                const newUser = new UserModel({
                    username: 'Google-' + profile._json.sub,
                    name: profile._json.name ? profile._json.name : 'Google-' + profile._json.sub,
                    email: profile._json.email
                        ? profile._json.email
                        : 'Google-' + profile._json.sub,
                    department: 'Google-' + profile._json.sub,
                    validated: false,
                })
                await newUser.save()
                const newOAuthEntry = new OAuthModel({
                    oAuthID: profile._json.sub,
                    oAuthProvider: 'google',
                    userID: newUser.id,
                })
                await newOAuthEntry.save()
                return { user: newUser }
            }
        }
    }
}
