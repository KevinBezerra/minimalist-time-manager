import { useEffect, useState } from "react";
import TaskItem  from "./TaskItem/TaskItem";
import "./TaskGroup.css";

function TaskGroup({title, icon, tasks, onDeleteTask, onCompleteTask, onUpdateTask, onUnassignTask }){
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        if (tasks.length > 0) {
            setIsOpen(true);
        }
    }, [tasks.length]);

    function handleToggle(){
        setIsOpen(!isOpen);
    }
    return (
        <div className="task-group">
            <div className="task-group-header" onClick={handleToggle}>
                <span className="task-group-icon">{icon}</span>
                <span className="task-group-title">{title} ({tasks.length})</span>
                <span className={`task-group-chevron ${isOpen ? "open" : "closed"}`}></span>
            </div>
            {isOpen && (
                <div className="task-group-body">
                    {tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onDeleteTask={onDeleteTask}
                            onCompleteTask={onCompleteTask}
                            onUpdateTask={onUpdateTask}
                            onUnassignTask={onUnassignTask}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}



export default TaskGroup;