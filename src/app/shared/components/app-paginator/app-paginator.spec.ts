import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Paginator } from './app-paginator';

@Component({
  standalone: true,
  imports: [Paginator],
  template: `<app-paginator [page]="1" [pageSize]="pageSize" [totalItems]="100" />`,
})
class Host {
  pageSize = 20;
}

describe('Paginator pageSize select', () => {
  it('muestra el pageSize recibido (20)', async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    console.log('SELECT VALUE:', JSON.stringify(select.value));
    expect(select.value).toBe('20');
  });
});
