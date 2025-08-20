import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MATERIAL_IMPORTS } from '../shared/material/material.imports';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ...MATERIAL_IMPORTS],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {}
