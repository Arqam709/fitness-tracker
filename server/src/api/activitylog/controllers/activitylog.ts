/**
 * activitylog controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::activitylog.activitylog',({strapi})=>({
    async create(ctx) {
        const user = ctx.state.user

        if(!user) return ctx.unauthorized('login required')

            const body = ctx.request.body.data;
            body.users_permissions_user = user.id;

            const entry = await strapi.entityService.create(
                "api::activitylog.activitylog", {
                data : body,
                populate : ["users_permissions_user"]

                }
            )
            return entry;
        },

        async find(ctx) {
        const user = ctx.state.user

        

            const result  = await strapi.entityService.findMany(
                "api::activitylog.activitylog", {
                filters : {users_permissions_user :user.id },
                populate : ["users_permissions_user"]

                }
            )
            return result;
        },

        async findOne(ctx) {
        const user = ctx.state.user

        const {id} = ctx.params;

        

            const result  = await strapi.entityService.findMany(
                "api::activitylog.activitylog", {
                filters : {id , users_permissions_user :user.id },
                populate : ["users_permissions_user"]

                }
            )

            if(!result.length) return ctx.notFound("Not found or not yours")
            return result[0];
        }
}));
