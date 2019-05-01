import {HomeComponent} from '../../routes/home/home.component';
import {
  AuthGuard,
  ConfigurationMenuConfigResolver,
  GeneralConfigResolver,
} from '@tibco-tcstk/tc-core-lib';
import {
  CaseGuard,
  ClaimsResolver,
  GroupsResolver,
  LaConfigResolver,
  LiveAppsConfigResolver,
  RolesResolver
} from '@tibco-tcstk/tc-liveapps-lib';
import {SplashComponent} from '../../components/splash/splash.component';
import {CaseComponent} from '../../routes/case/case.component';
import {ConfigurationComponent} from '../../routes/configuration/configuration.component';
import {CONFIGURATION_ROUTE_CONFIG, CONFIGURATION_ROUTE_PROVIDERS } from './configuration-route-config/configuration-route-config';
import {ReportingComponent} from '../../routes/reporting/reporting.component';

export const HOME_ROUTE = 'home';

export const STARTER_APP_ROUTES =
[
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    resolve: {
      claims: ClaimsResolver,
      laConfigHolder: LaConfigResolver,
      groups: GroupsResolver,
      roles: RolesResolver
    }
  },
  {
    path: 'splash',
    component: SplashComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'case/:appId/:typeId/:caseRef',
    component: CaseComponent,
    canActivate: [AuthGuard, CaseGuard],
    resolve: {
      laConfigHolder: LaConfigResolver,
      claims: ClaimsResolver,
      groups: GroupsResolver,
      roles: RolesResolver
    }
  },
  {
    path: 'configuration', component: ConfigurationComponent, canActivate: [AuthGuard],
    resolve: {configurationMenuHolder: ConfigurationMenuConfigResolver},
    children: CONFIGURATION_ROUTE_CONFIG
  },
  {
    path: 'reporting', component: ReportingComponent, canActivate: [AuthGuard],
    resolve: {
      laConfigHolder: LaConfigResolver,
      claims: ClaimsResolver,
    }
  },
  {
    path: '', redirectTo: '/starterApp/home', pathMatch: 'full'
  },
  {
    path: '**', redirectTo: '/starterApp/home'
  }
];

export const STARTER_APP_PROVIDERS = [
  [
  ClaimsResolver,
  LiveAppsConfigResolver,
  LaConfigResolver,
  GeneralConfigResolver,
  ConfigurationMenuConfigResolver,
  RolesResolver,
  GroupsResolver
  ],
  CONFIGURATION_ROUTE_PROVIDERS
];

