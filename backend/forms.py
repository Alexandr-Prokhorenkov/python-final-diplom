from django import forms


class PriceImportForm(forms.Form):
    """Загрузка YAML-прайса из админки: файл или URL."""

    yaml_file = forms.FileField(
        label='YAML-файл',
        required=False,
        help_text='Например data/shop1.yaml',
    )
    yaml_url = forms.URLField(
        label='URL прайса',
        required=False,
        help_text='Альтернатива файлу: публичная ссылка на YAML',
    )

    def clean(self):
        cleaned = super().clean()
        if not cleaned.get('yaml_file') and not cleaned.get('yaml_url'):
            raise forms.ValidationError('Укажите YAML-файл или URL.')
        return cleaned
