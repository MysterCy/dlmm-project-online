from django.contrib import admin
from .models import Account, Transaction, Category, LivretA, Subcategory

# Création de la classe Inline pour les sous-catégories
class SubcategoryInline(admin.TabularInline):
    model = Subcategory
    extra = 1

# Création d'une classe d'administration personnalisée pour le modèle Category
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_subcategories',)
    search_fields = ('name',)
    inlines = [SubcategoryInline]

    def get_subcategories(self, obj):
        return ", ".join([sub.name for sub in obj.subcategories.all()])
    
    get_subcategories.short_description = 'Sous-catégories'

# Enregistrement des modèles
admin.site.register(Account)
admin.site.register(LivretA)
admin.site.register(Category, CategoryAdmin)

# Création d'une classe d'administration personnalisée pour le modèle Transaction
class TransactionAdmin(admin.ModelAdmin):
    # Utilisation de méthodes personnalisées pour un affichage stable
    list_display = (
        'date',
        'description',
        'amount',
        'get_category_name', 
        'get_subcategory_name',
        'account',
    )
    
    list_display_links = ('description',)
    list_editable = ('amount',)
    
    # Correction des filtres pour utiliser les noms des champs
    list_filter = ('category', 'subcategory', 'account', 'date',)
    
    search_fields = ('description', 'category__name', 'subcategory__name',)
    date_hierarchy = 'date'

    # Méthodes pour afficher les noms de la catégorie et de la sous-catégorie
    def get_category_name(self, obj):
        return obj.category.name if obj.category else 'Non classé'
    get_category_name.short_description = 'Catégorie'

    def get_subcategory_name(self, obj):
        return obj.subcategory.name if obj.subcategory else 'Non classé'
    get_subcategory_name.short_description = 'Sous-catégorie'

# Enregistrement du modèle Transaction avec la classe d'administration personnalisée
admin.site.register(Transaction, TransactionAdmin)