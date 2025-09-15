import AsyncStorage from '@react-native-async-storage/async-storage';

class CategoryService {
  private static instance: CategoryService;
  private readonly CATEGORIES_KEY = 'custom_categories';

  private constructor() {}

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  async getCategories(): Promise<string[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      const customCategories = categoriesJson ? JSON.parse(categoriesJson) : [];
      // Return default categories plus custom ones
      return ['work', 'study', 'coding', 'reading', 'exercise', ...customCategories];
    } catch (error) {
      console.error('Error getting categories:', error);
      return ['work', 'study', 'coding', 'reading', 'exercise'];
    }
  }

  async addCategory(categoryName: string): Promise<void> {
    try {
      const categoriesJson = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      const customCategories = categoriesJson ? JSON.parse(categoriesJson) : [];
      
      const trimmedName = categoryName.trim().toLowerCase();
      if (trimmedName && !customCategories.includes(trimmedName)) {
        customCategories.push(trimmedName);
        await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(customCategories));
      }
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  async removeCategory(categoryName: string): Promise<void> {
    try {
      const categoriesJson = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      const customCategories = categoriesJson ? JSON.parse(categoriesJson) : [];
      
      const filteredCategories = customCategories.filter((cat: string) => cat !== categoryName.toLowerCase());
      await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(filteredCategories));
    } catch (error) {
      console.error('Error removing category:', error);
    }
  }
}

export default CategoryService;
