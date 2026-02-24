import { useState, FormEvent } from 'react';
import { useStore, Task } from '../store/useStore';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Circle, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      dueDate: new Date().toISOString(),
    });

    setNewTaskTitle('');
    toast.success('تم إضافة المهمة');
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-cyan-600" />
            المهام والتذكيرات
          </h1>
          <p className="text-lg text-slate-500">
            لديك <span className="font-bold text-cyan-600">{pendingTasks.length}</span> مهام غير منجزة
          </p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleAddTask} className="flex gap-4">
            <input 
              type="text" 
              placeholder="أضف مهمة جديدة..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow shadow-sm"
            />
            <button 
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-6 h-6" />
              إضافة
            </button>
          </form>
        </div>

        <div className="p-6 space-y-8">
          {/* Pending Tasks */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Circle className="w-5 h-5 text-amber-500" />
              مهام قيد التنفيذ
            </h2>
            {pendingTasks.length > 0 ? (
              <ul className="space-y-3">
                {pendingTasks.map(task => (
                  <li 
                    key={task.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-300 transition-colors group"
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <button className="text-slate-400 hover:text-cyan-500 transition-colors">
                        <Circle className="w-8 h-8" />
                      </button>
                      <span className="font-bold text-lg text-slate-800">{task.title}</span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-lg font-bold">لا توجد مهام قيد التنفيذ حالياً.</p>
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2 opacity-70">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                مهام منجزة
              </h2>
              <ul className="space-y-3 opacity-70">
                {completedTasks.map(task => (
                  <li 
                    key={task.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 group"
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                      <button className="text-emerald-500">
                        <CheckCircle2 className="w-8 h-8" />
                      </button>
                      <span className="font-bold text-lg text-slate-500 line-through">{task.title}</span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
