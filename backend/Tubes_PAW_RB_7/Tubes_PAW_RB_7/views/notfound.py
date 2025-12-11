from pyramid.view import notfound_view_config


@notfound_view_config(renderer='Tubes_PAW_RB_7:templates/404.jinja2')
def notfound_view(request):
    request.response.status = 404
    return {}
