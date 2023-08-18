import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignDialogComponent } from './campaign-dialog.component';

describe('CampaignDialogComponent', () => {
  let component: CampaignDialogComponent;
  let fixture: ComponentFixture<CampaignDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
