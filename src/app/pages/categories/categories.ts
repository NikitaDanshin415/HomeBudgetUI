import {Component, computed, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CategoriesService} from '../../services/categories.service';
import {Category, CategoryType} from '../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories {
  private readonly formBuilder = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['spend' as CategoryType, [Validators.required]],
  });

  readonly incomeCategories = computed(() => this.sortCategories(this.categoriesService.income()));
  readonly spendCategories = computed(() => this.sortCategories(this.categoriesService.spend()));
  readonly state = this.categoriesService.state;
  readonly error = this.categoriesService.error;

  async ngOnInit(): Promise<void> {
    await this.categoriesService.load();
  }

  async add(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const {name, type} = this.form.getRawValue();
    await this.categoriesService.add({name: name.trim(), type});
    this.form.controls.name.reset('');
  }

  async archive(id: number, type: CategoryType): Promise<void> {
    await this.categoriesService.archive(type, id);
  }

  private sortCategories(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => Number(a.archived) - Number(b.archived));
  }
}
