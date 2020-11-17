
# 是否值的列表
YES_LIST = ['y', 'yes', 'Y', 'YES', 'Yes']
NO_LIST = ['n', 'no', 'N', 'NO', 'No']
# 默认博客网站根URL
DEFAULT_WEB_URL = 'https://didnelpsun.github.io/'
# 博客网站生成器列表
POST_FORMAT_LIST = ['Jekyll', 'jekyll']
# 默认博客网站生成器
DEFAULT_POST_FORMAT = 'Jekyll'
# 默认博客文章相对路径
DEFAULT_FILE_PATH = './_posts/notes'


# 循环确认输入值是否为值域值，参数为提示字符串，值域列表，排除字符串
def loop_get(text, list, exclude=''):
    value = input(f'{text} {list}：').strip()
    if value == exclude:
        return value
    while value not in list:
        print(f'你输入了{value}，不属于取值域')
        value = input(f'{text} {list}：').strip()
    return value


if __name__ == '__main__':
    # print('使用GM文件生成对应博客目录MD文件...')
    is_default = loop_get('是否采用默认生成模式？', YES_LIST+NO_LIST)
    web_url = DEFAULT_WEB_URL
    post_format = DEFAULT_POST_FORMAT
    file_path = DEFAULT_FILE_PATH
    if is_default in NO_LIST:
        print('如果对应选项不进行更改则直接回车')
        print(f'默认博客网站根URL是：{DEFAULT_WEB_URL}')
        web_url = input('请输入修改后博客网站根URL：')
        print(f'默认博客网站生成器是：{DEFAULT_POST_FORMAT}')
        post_format = loop_get('请输入修改后格式：', POST_FORMAT_LIST)
        print(f'默认博客文章相对于本文件路径是：{DEFAULT_FILE_PATH}')
        file_path = input('请输入修改后文章相对路径：')
        print(f'默认MD生成文件是以相对路径{file_path}下第一层文件夹遍历得到H1标题')
    print('总的配置是：')
    print(f'博客文件格式是：{post_format}')
    print(f'博客文章相对路径是：{file_path}')
    print(f'默认博客网站根URL是：{web_url}')
