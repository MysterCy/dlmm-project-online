from django.contrib import admin
from .models import Account, Transaction, Category, LivretA, Subcategory

# Enregistrement des modèles
admin.site.register(Account)
admin.site.register(LivretA)

# Création d'une classe d'administration personnalisée pour le modèle Transaction
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('date', 'description', 'amount', 'category', 'subcategory', 'account',)
    list_filter = ('category',)
    list_display_links = ('description', 'amount',)
    list_editable = ('category', 'subcategory',)
    search_fields = ('description', 'category__name', 'subcategory__name',)
    date_hierarchy = 'date'

# Enregistrement du modèle Transaction avec la classe d'administration personnalisée
admin.site.register(Transaction, TransactionAdmin)

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
        # Cette méthode récupère et affiche les sous-catégories pour un objet Catégorie donné
        return ", ".join([sub.name for sub in obj.subcategories.all()])
    
    get_subcategories.short_description = 'Sous-catégories'

# Enregistrement du modèle Category avec la classe d'administration personnalisée
admin.site.register(Category, CategoryAdmin)