import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Wallets } from './pages/wallets/wallets';
import { Categories } from './pages/categories/categories';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'wallets', component: Wallets },
  { path: 'categories', component: Categories },
  { path: '**', redirectTo: '' },
];
