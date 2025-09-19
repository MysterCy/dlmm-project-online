from django.contrib import admin
from .models import Account, Transaction, Category, LivretA, Subcategory

# Enregistrement des modèles
admin.site.register(Account)
admin.site.register(LivretA)

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

# Enregistrement du modèle Category avec la classe d'administration personnalisée
admin.site.register(Category, CategoryAdmin)

# Création d'une classe d'administration personnalisée pour le modèle Transaction
class TransactionAdmin(admin.ModelAdmin):
    # Les champs à afficher dans la liste des transactions
    list_display = ('date', 'description', 'amount', 'category', 'subcategory', 'account',)
    
    # Les champs sur lesquels on peut cliquer pour modifier la transaction
    list_display_links = ('description',)
    
    # Les champs qui peuvent être édités directement dans la liste
    list_editable = ('amount',)
    
    # Les filtres disponibles dans la barre latérale
    list_filter = ('category', 'subcategory', 'account', 'date',)
    
    # Barre de recherche
    search_fields = ('description', 'category__name', 'subcategory__name',)
    
    # Lien vers la date de la hiérarchie pour naviguer par date
    date_hierarchy = 'date'

# Enregistrement du modèle Transaction avec la classe d'administration personnalisée
admin.site.register(Transaction, TransactionAdmin)