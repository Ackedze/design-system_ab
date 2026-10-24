#!/usr/bin/env python3
"""Local run inventory and honest usage report; no network or Figma mutations."""
import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path


def now():
    return datetime.now(timezone.utc).isoformat()


def write_json(path, value, exclusive=False):
    with path.open('x' if exclusive else 'w', encoding='utf-8') as output:
        json.dump(value, output, ensure_ascii=False, indent=2)
        output.write('\n')


def source_record(file, role, mode, text_bytes=0, lines=None):
    path = Path(file).expanduser().resolve(strict=True)
    if not path.is_file():
        raise ValueError('Expected a regular file: ' + str(path))
    body = path.read_bytes()
    return {'path': str(path), 'role': role, 'mode': mode,
            'sha256': hashlib.sha256(body).hexdigest(), 'bytes': len(body),
            'modelTextBytes': text_bytes, 'lines': lines, 'recordedAt': now()}


def normalize_usage(value):
    if not isinstance(value, dict) or value.get('scope') != 'run-delta':
        raise ValueError('Usage must explicitly declare scope=run-delta; do not pass cumulative session totals')
    keys = ['input_tokens', 'output_tokens', 'cached_input_tokens', 'reasoning_output_tokens']
    result = {}
    for key in keys:
        number = value.get(key)
        if number is not None and (type(number) is not int or number < 0):
            raise ValueError('Invalid usage counter: ' + key)
        result[key] = number
    if result['input_tokens'] is None or result['output_tokens'] is None:
        raise ValueError('Real usage requires input_tokens and output_tokens')
    for subset, total in [('cached_input_tokens', 'input_tokens'), ('reasoning_output_tokens', 'output_tokens')]:
        if result[subset] is not None and result[subset] > result[total]:
            raise ValueError('Usage subset exceeds total: ' + subset)
    result['total_tokens'] = result['input_tokens'] + result['output_tokens']
    if value.get('total_tokens') is not None and value['total_tokens'] != result['total_tokens']:
        raise ValueError('Usage total must equal input + output; cached/reasoning are subsets')
    result['source'] = value.get('source', 'provided host usage')
    result['sampledAt'] = value.get('sampledAt')
    return result


def load_run(root):
    value = json.loads((root / 'run.json').read_text())
    if value['closed']:
        raise ValueError('This run is closed; create a new run for a continuation')
    return value


def link(file):
    path = str(Path(file).resolve())
    return '[' + Path(path).name.replace('[', '\\[').replace(']', '\\]') + '](<' + path + '>)'


def finish(root, run, result_path, status, usage_path):
    result = json.loads(Path(result_path).read_text())
    for field in ['checks', 'issues', 'limits']:
        if not isinstance(result.get(field), list):
            raise ValueError('Result requires a list: ' + field)
    if status == 'completed' and (not result.get('figmaUrl') or not result.get('rootId')):
        raise ValueError('A completed layout requires its actual Figma URL and rootId')
    run['events'].append(source_record(result_path, 'result', 'inspect'))
    if usage_path:
        usage = normalize_usage(json.loads(Path(usage_path).read_text()))
        run['events'].append(source_record(usage_path, 'usage', 'inspect'))
        run['usage'] = {'method': 'host-run-delta', **usage}
        text = ('Учтено средой: ' + str(usage['total_tokens']) + ' токенов; входящие ' +
                str(usage['input_tokens']) + ', исходящие ' + str(usage['output_tokens']) +
                '. Кэш во входящих: ' + str(usage['cached_input_tokens'] if usage['cached_input_tokens'] is not None else 'UNKNOWN') +
                '; reasoning в исходящих: ' + str(usage['reasoning_output_tokens'] if usage['reasoning_output_tokens'] is not None else 'UNKNOWN') +
                '. Подмножества повторно не складываются. Источник: ' + str(usage['source']) + '.')
    else:
        size = sum(event['modelTextBytes'] for event in run['events'])
        estimate = math.ceil(size / 4)
        bounds = [math.ceil(size / 6), math.ceil(size / 2)]
        run['usage'] = {'method': 'registered-text-byte-estimate', 'registeredTextBytes': size,
                        'estimatedRegisteredTextTokens': estimate, 'range': bounds, 'fullModelUsage': None}
        text = ('Полный расход модели: UNKNOWN — реальные счётчики среды не предоставлены. '
                'Оценка учтённого текстового объёма: ≈' + str(estimate) + ' токенов (диапазон ' +
                str(bounds[0]) + '–' + str(bounds[1]) + '; UTF-8 bytes / 4). '
                'Это не оценка полного счёта: скрытый контекст, изображения, reasoning и прочие обращения сюда не входят.')
    report = ['# Отчёт навыка: лендинг AB', '', 'Статус: ' + status + '.', '',
              result.get('summary', ''), '', '## Макет', '',
              ('[Открыть Figma](' + result['figmaUrl'] + ')') if result.get('figmaUrl') else 'Макет пока не создан.',
              '', '## Токены', '', text, '', '## Проверки', '']
    report += ['- ' + str(check.get('name')) + ': ' + str(check.get('verdict')) +
               ('; ' + str(check['evidence']) if check.get('evidence') else '') for check in result['checks']]
    report += ['', '## Проблемы и гэпы', '']
    report += [('- ' + str(issue.get('kind', 'issue')) + ': ' + str(issue.get('description')) +
                '; влияние: ' + str(issue.get('impact', 'не указано')) +
                '; статус: ' + str(issue.get('status', 'open'))) for issue in result['issues']] or ['Не зарегистрированы.']
    report += ['', '## Оставшиеся вопросы', '']
    report += ['- ' + (question if isinstance(question, str) else str(question.get('question'))) for question in result.get('questions', [])] or ['Нет.']
    report += ['', '## Ограничения проверки', '']
    report += ['- ' + str(limit) for limit in result['limits']] or ['Не указаны.']
    report += ['', '## Полный список использованных файлов', '',
               'Режим read означает вывод содержимого скриптом; inspect/execute/hash-only '
               'и inherited-context не доказывают чтение норм моделью. Повторные чтения учитываются отдельно в run.json.', '']
    groups = {}
    for event in run['events']:
        key = (event['path'], event['sha256'], event['role'], event['mode'])
        groups.setdefault(key, event)
    for event in groups.values():
        report.append('- ' + link(event['path']) + ' — ' + event['role'] + ' / ' + event['mode'] +
                      '; SHA256 `' + event['sha256'] + '`' +
                      ('; строки ' + event['lines'] if event.get('lines') else ''))
    run.update({'closed': True, 'status': status, 'finishedAt': now(), 'result': str(Path(result_path).resolve())})
    with (root / 'REPORT.md').open('x', encoding='utf-8') as output:
        output.write('\n'.join(report) + '\n')
    write_json(root / 'run.json', run)
    return {'status': status, 'report': str((root / 'REPORT.md').resolve()), 'usage': run['usage']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['start', 'read', 'track', 'finish'])
    parser.add_argument('run', type=Path)
    parser.add_argument('--brief', type=Path)
    parser.add_argument('--role', default='source')
    parser.add_argument('--mode', choices=['inspect', 'execute', 'hash-only', 'inherited-context'], default='inspect')
    parser.add_argument('--lines', help='One-based inclusive start:end')
    parser.add_argument('--status', choices=['completed', 'needs-input', 'interrupted'])
    parser.add_argument('--result', type=Path)
    parser.add_argument('--usage', type=Path)
    parser.add_argument('files', nargs='*')
    args = parser.parse_intermixed_args()
    root = args.run.expanduser().resolve()
    if args.command == 'start':
        if not args.brief:
            parser.error('start requires --brief')
        root.mkdir(parents=True, exist_ok=True)
        body = args.brief.read_bytes()
        destination = root / 'brief.txt'
        if args.brief.resolve() != destination:
            with destination.open('xb') as output:
                output.write(body)
        run = {'schemaVersion': 'ab.landing-run.v1', 'closed': False, 'startedAt': now(),
               'events': [source_record(destination, 'brief', 'read', len(body))]}
        write_json(root / 'run.json', run, exclusive=True)
        print(json.dumps({'run': str(root), 'started': True}))
        return
    run = load_run(root)
    if args.command == 'finish':
        if not args.result or not args.status:
            parser.error('finish requires --result and --status')
        print(json.dumps(finish(root, run, args.result, args.status, args.usage), ensure_ascii=False))
        return
    if not args.files:
        parser.error('read/track requires files')
    records = []
    for file in args.files:
        if args.command == 'read':
            path = Path(file).expanduser().resolve(strict=True)
            text = path.read_text(encoding='utf-8')
            if args.lines:
                bounds = args.lines.split(':')
                if len(bounds) != 2 or not all(part.isdigit() for part in bounds):
                    raise ValueError('Expected start:end')
                first, last = map(int, bounds)
                if first < 1 or last < first:
                    raise ValueError('Invalid line range')
                text = ''.join(text.splitlines(keepends=True)[first-1:last])
            record = source_record(path, args.role, 'read', len(text.encode('utf-8')), args.lines)
            run['events'].append(record)
            write_json(root / 'run.json', run)
            print(text)
        else:
            records.append(source_record(file, args.role, args.mode))
    run['events'].extend(records)
    write_json(root / 'run.json', run)
    if args.command == 'track':
        print(json.dumps({'tracked': len(records)}))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, json.JSONDecodeError) as error:
        raise SystemExit(str(error)) from error
