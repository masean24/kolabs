import type { ConsoleEntry, ExecutionResult, TurtleCommand } from '../types/lab';
import { getPyodide } from './pythonRunner';

/**
 * Menjalankan kode Python Turtle menggunakan Pyodide + modul virtual `turtle`
 * yang merekam daftar perintah vektor (`TurtleCommand[]`) untuk digambar di HTML5 Canvas.
 */
export async function runTurtleCode(
  code: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    const pyodide = await getPyodide(onStatus);
    onStatus?.('Menggambar pola Python Turtle...');

    pyodide.globals.set('__kodie_turtle_code__', code);

    const harness = `
import sys, io, types, json, traceback, math

_kodie_cmds = []
_MAX_CMDS = 5000

def _emit(cmd):
    if len(_kodie_cmds) >= _MAX_CMDS:
        raise RuntimeError("Batas maksimum 5000 perintah Turtle tercapai (cek apakah ada loop tak terbatas).")
    _kodie_cmds.append(cmd)

class _KodieScreen:
    def bgcolor(self, color="#FFFFFF"):
        _emit({"type": "bgcolor", "color": str(color)})
    def title(self, *args):
        pass
    def setup(self, *args, **kwargs):
        pass
    def mainloop(self):
        pass
    def exitonclick(self):
        pass
    def clear(self):
        _emit({"type": "clear"})

_default_screen = _KodieScreen()

class _KodieTurtle:
    def __init__(self):
        self._x = 0.0
        self._y = 0.0
        self._heading = 0.0

    def forward(self, dist):
        d = float(dist)
        rad = math.radians(self._heading)
        self._x += d * math.cos(rad)
        self._y += d * math.sin(rad)
        _emit({"type": "move", "distance": d})
    fd = forward

    def backward(self, dist):
        self.forward(-float(dist))
    bk = backward
    back = backward

    def right(self, angle):
        a = float(angle)
        self._heading = (self._heading - a) % 360.0
        _emit({"type": "turn", "angle": -a})
    rt = right

    def left(self, angle):
        a = float(angle)
        self._heading = (self._heading + a) % 360.0
        _emit({"type": "turn", "angle": a})
    lt = left

    def setheading(self, angle):
        self._heading = float(angle) % 360.0
        _emit({"type": "setheading", "angle": self._heading})
    seth = setheading

    def goto(self, x, y=None):
        if isinstance(x, (tuple, list)) and y is None:
            nx, ny = float(x[0]), float(x[1])
        else:
            nx, ny = float(x), float(y)
        self._x, self._y = nx, ny
        _emit({"type": "goto", "x": nx, "y": ny})
    setpos = goto
    setposition = goto

    def setx(self, x):
        self.goto(float(x), self._y)

    def sety(self, y):
        self.goto(self._x, float(y))

    def home(self):
        self.goto(0.0, 0.0)
        self.setheading(0.0)

    def penup(self):
        _emit({"type": "pen", "down": False})
    pu = penup
    up = penup

    def pendown(self):
        _emit({"type": "pen", "down": True})
    pd = pendown
    down = pendown

    def pencolor(self, *args):
        if len(args) == 1:
            _emit({"type": "color", "penColor": str(args[0])})
        elif len(args) == 3:
            _emit({"type": "color", "penColor": f"rgb({int(args[0])},{int(args[1])},{int(args[2])})"})

    def fillcolor(self, *args):
        if len(args) == 1:
            _emit({"type": "fillcolor", "fillColor": str(args[0])})
        elif len(args) == 3:
            _emit({"type": "fillcolor", "fillColor": f"rgb({int(args[0])},{int(args[1])},{int(args[2])})"})

    def color(self, *args):
        if len(args) == 1:
            c = str(args[0])
            _emit({"type": "color", "penColor": c, "fillColor": c})
        elif len(args) >= 2:
            _emit({"type": "color", "penColor": str(args[0]), "fillColor": str(args[1])})

    def pensize(self, width):
        _emit({"type": "pensize", "size": float(width)})
    width = pensize

    def begin_fill(self):
        _emit({"type": "begin_fill"})

    def end_fill(self):
        _emit({"type": "end_fill"})

    def circle(self, radius, extent=360):
        _emit({"type": "circle", "radius": float(radius), "extent": float(extent)})

    def dot(self, size=None, color=None):
        cmd = {"type": "dot"}
        if size is not None:
            cmd["size"] = float(size)
        if color is not None:
            cmd["color"] = str(color)
        _emit(cmd)

    def write(self, arg, move=False, align="left", font=("Arial", 12, "normal")):
        size = 14
        if isinstance(font, (tuple, list)) and len(font) >= 2:
            try:
                size = int(font[1])
            except Exception:
                pass
        _emit({"type": "write", "text": str(arg), "fontSize": size})

    def speed(self, val=6):
        if isinstance(val, str):
            mapping = {"fastest": 0, "fast": 10, "normal": 6, "slow": 3, "slowest": 1}
            _emit({"type": "speed", "value": mapping.get(val, 6)})
        else:
            _emit({"type": "speed", "value": int(val)})

    def hideturtle(self):
        _emit({"type": "visibility", "visible": False})
    ht = hideturtle

    def showturtle(self):
        _emit({"type": "visibility", "visible": True})
    st = showturtle

    def clear(self):
        _emit({"type": "clear"})

    def xcor(self):
        return self._x

    def ycor(self):
        return self._y

    def heading(self):
        return self._heading

    def position(self):
        return (self._x, self._y)
    pos = position

_turtle_mod = types.ModuleType("turtle")
_turtle_mod.Turtle = _KodieTurtle
_turtle_mod.Pen = _KodieTurtle
_turtle_mod.Screen = lambda: _default_screen

_default_t = _KodieTurtle()
for _fn in [
    "forward", "fd", "backward", "bk", "back",
    "right", "rt", "left", "lt", "setheading", "seth",
    "goto", "setpos", "setposition", "setx", "sety", "home",
    "penup", "pu", "up", "pendown", "pd", "down",
    "pencolor", "fillcolor", "color", "pensize", "width",
    "begin_fill", "end_fill", "circle", "dot", "write",
    "speed", "hideturtle", "ht", "showturtle", "st", "clear",
    "xcor", "ycor", "heading", "position", "pos"
]:
    setattr(_turtle_mod, _fn, getattr(_default_t, _fn))

_turtle_mod.bgcolor = _default_screen.bgcolor
_turtle_mod.done = lambda: None
_turtle_mod.mainloop = lambda: None
_turtle_mod.exitonclick = lambda: None
_turtle_mod.__all__ = [k for k in dir(_turtle_mod) if not k.startswith("_")]

_prev_turtle = sys.modules.get("turtle")
sys.modules["turtle"] = _turtle_mod

_kodie_stdout = io.StringIO()
_kodie_stderr = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr
sys.stdout = _kodie_stdout
sys.stderr = _kodie_stderr

_t_err = ""
_t_exit = 0
_ns = {"__name__": "__main__"}
try:
    exec(compile(__kodie_turtle_code__, "turtle_art.py", "exec"), _ns)
except Exception:
    _t_exit = 1
    _t_err = traceback.format_exc()
finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr
    if _prev_turtle is not None:
        sys.modules["turtle"] = _prev_turtle

_kodie_turtle_result = (
    json.dumps(_kodie_cmds),
    _kodie_stdout.getvalue(),
    _kodie_stderr.getvalue(),
    _t_err,
    _t_exit,
)
`;

    await pyodide.runPythonAsync(harness);
    const proxy = pyodide.globals.get('_kodie_turtle_result') as {
      toJs: () => [string, string, string, string, number];
      destroy?: () => void;
    };
    const [cmdsJson, stdout, stderr, pyErr, exitCode] = proxy.toJs();
    proxy.destroy?.();

    const commands = JSON.parse(cmdsJson) as TurtleCommand[];
    const combinedErr = [stderr, pyErr].filter(Boolean).join('\n').trim();
    const ok = exitCode === 0 && !combinedErr;

    const consoleLogs: ConsoleEntry[] = [];
    if (stdout) {
      consoleLogs.push({
        id: `t-out-${Date.now()}`,
        level: 'log',
        text: stdout,
        timestamp: Date.now(),
      });
    }
    if (combinedErr) {
      consoleLogs.push({
        id: `t-err-${Date.now()}`,
        level: 'error',
        text: combinedErr,
        timestamp: Date.now(),
      });
    }

    return {
      track: 'turtle',
      ok,
      stdout,
      stderr: combinedErr,
      consoleLogs,
      turtleCommands: commands,
      exitCode,
      durationMs: Math.round(performance.now() - start),
      errorRaw: combinedErr || undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'turtle',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `t-sys-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      turtleCommands: [],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
