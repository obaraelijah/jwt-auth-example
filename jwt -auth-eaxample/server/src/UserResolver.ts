import {Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware, Int} from 'type-graphql'
import { User } from './entity/User';
import {compare, hash} from 'bcryptjs'
import { MyContext } from './MyContext';
import { createAccessToken, createRefreshToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './sendRefreshToken';
import { getConnection } from 'typeorm';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver()
export class UserResolver {
    @Query(() => String)
    hello() {
        return 'hi';
    }


    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(
        @Ctx() {payload}: MyContext
    ) {
        console.log(payload)
        return `your user id: ${payload!.userId}}`;
    }



//finding users
    @Query(() => [User])
    users() {
        return User.find();
    }

  @Mutation(() => Boolean)
 async  revokeRefreshTokenForUser(
    @Arg('userId', () => Int )userId: number
  ){
    await  getConnection()
    .getRepository(User)
    .increment({id: userId}, 'tokenVersion', 1)

    return true;
  }



//register
    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {

        const hashedPassword =await hash(password, 12)

        try {
            await User.insert({
                email,
                password: hashedPassword
            });
    
        } catch (err) {
            console.log(err);
            return false;
        }
       

        return true;
    }

//login
    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() {res}: MyContext
        ): Promise<LoginResponse>{
            const user = await User.findOne({where: {email}});

            if (!user) {
                throw new Error("user does not exist");
            }

            const valid =await compare(password, user.password)

            if (!valid) {
                throw new Error("Incorrect password")
            }

       // login successful
             
       sendRefreshToken(res, createRefreshToken(user) )
       

        return {
            accessToken: createAccessToken(user)
        };
    }
} 