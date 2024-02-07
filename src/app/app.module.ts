import { SortablejsModule } from 'ngx-sortablejs-simple';

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ArmoryModule } from './pages/armory/armory.module';
import { ExportModule } from './pages/export/export.module';
import { IconSelectorModule } from './pages/icon-selector/icon-selector.module';
import { SelectorModule } from './pages/selector/selector.module';
import { SettingModule } from './pages/setting/setting.module';
import { SquadTextModule } from './pages/squad-text/squad-text.module';
import { PreloadService } from './services/preload.service';
import { APP_BASE_HREF, NgOptimizedImage } from "@angular/common";
import { CampaignDialogModule } from './pages/campaign-dialog/campaign-dialog.module';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		SortablejsModule,

		ArmoryModule,
		ExportModule,
		SelectorModule,
		IconSelectorModule,
		SettingModule,
		CampaignDialogModule,
		SquadTextModule,

		MatButtonModule,
		MatDialogModule,
		MatIconModule,
		MatSnackBarModule,
		MatToolbarModule,
		MatTooltipModule,

		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production,
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: 'registerWhenStable:30000',
		}),
		NgOptimizedImage,
	],
	providers: [
		{
			provide: APP_BASE_HREF,
			useValue: '/ba-armory/',
		},
		PreloadService,
		{
			provide: APP_INITIALIZER,
			useFactory: PreloadService.initialize,
			multi: true,
			deps: [PreloadService],
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
