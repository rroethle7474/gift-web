import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishListOverviewComponent } from './wish-list-overview.component';

describe('WishListOverviewComponent', () => {
  let component: WishListOverviewComponent;
  let fixture: ComponentFixture<WishListOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishListOverviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishListOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
