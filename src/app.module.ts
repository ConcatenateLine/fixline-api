import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { GrapqlModule } from 'src/grapql/grapql.module';
import { UsersModule } from 'src/users/users.module';
import { TenantsModule } from 'src/tenants/tenants.module';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PlansModule } from 'src/plans/plans.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [
    GrapqlModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRY || '60s' },
    }),
    UsersModule,
    AuthModule,
    TenantsModule,
    PlansModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
