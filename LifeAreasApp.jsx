import React, { useState, useEffect, useRef } from "react";
import { PlusCircle, UserPlus, Plus, Calendar, Check, Trash2 } from "lucide-react";

// Mock data service to replace axios calls
const dataService = {
  getRelationships: () => Promise.resolve(["Mom", "Dad", "Partner"]),
  addRelationship: (name) => Promise.resolve({ people: ["Mom", "Dad", "Partner", name] })
};

// Simple LifeArea Component
function LifeArea({ label, angle, onClick, colorClass, onAddPerson, onDragOver, onDrop, scale = 1 }) {
  // Centering the diagram in the container
  const centerX = 50; // Using percentages instead of fixed px
  const centerY = 50;
  const radius = 38 * scale; // Using percentages of container size
  const rad = (angle * Math.PI) / 180;
  
  // Calculate position around the circle using percentages
  const x = centerX + radius * Math.cos(rad);
  const y = centerY + radius * Math.sin(rad);
  
  // Size of the life area box - responsive
  const boxWidth = 22 * scale; // percentage of container
  const boxHeight = 11 * scale;
  
  const handleClick = () => {
    onClick(label, { x, y });
  };
  
  const safeLabel = typeof label === 'string' ? label : 'Unlabeled';
  
  return (
    <div
      className={`absolute z-10 text-gray-800 flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer hover:opacity-100 transition-transform duration-200 hover:scale-105 ${colorClass || ''}`}
      style={{ 
        left: `${x}%`, 
        top: `${y}%`, 
        width: `${boxWidth}%`, 
        height: `${boxHeight}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="relative w-full h-full flex items-center justify-center text-center font-medium text-sm md:text-base">
        {safeLabel}
        {safeLabel === "Relationships" && onAddPerson && (
          <div className="absolute z-20" style={{ right: '-8px', top: '-8px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddPerson();
              }}
              className="bg-white border border-pink-500 text-pink-500 rounded-full p-1 shadow hover:bg-pink-100"
            >
              <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Relationship subnodes component
function PeopleNodes({ people, mainNodePosition, containerSize }) {
  const [showingMorePeople, setShowingMorePeople] = useState(false);
  
  if (!people || people.length === 0) return null;
  
  // Center point coordinates (percentages)
  const centerX = 50;
  const centerY = 50;
  
  // Positioning constants
  const outerRadius = 45; // Percentage beyond main nodes
  
  // Calculate the angle of the relationship node from center
  const mainNodeAngle = Math.atan2(
    mainNodePosition.y - centerY, 
    mainNodePosition.x - centerX
  );
  
  // Determine which people to show based on current state
  const visibleCount = 2;
  const visiblePeople = showingMorePeople 
    ? people.slice(visibleCount) 
    : people.slice(0, visibleCount);
  
  // Calculate positions in an arc
  const arcSpan = Math.PI / 6; // 30 degrees
  const startAngle = mainNodeAngle - (arcSpan / 2);
  
  const extraCount = showingMorePeople ? visibleCount : people.length - visibleCount;
  const hasExtra = showingMorePeople ? visibleCount > 0 : people.length > visibleCount;
  
  const nodeWidth = containerSize < 640 ? 60 : 70; // Responsive width
  
  return (
    <>
      {/* Render visible people nodes */}
      {visiblePeople.map((person, idx) => {
        const angleStep = arcSpan / (visiblePeople.length || 1);
        const angle = startAngle + (idx * angleStep);
        
        // Position on outer circle
        const personX = centerX + outerRadius * Math.cos(angle);
        const personY = centerY + outerRadius * Math.sin(angle);
        
        return (
          <div key={`person-${idx}-${showingMorePeople ? 'more' : 'main'}`}>
            {/* Connector line */}
            <svg style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none', 
              zIndex: 5 
            }}>
              <line 
                x1={`${mainNodePosition.x}%`} 
                y1={`${mainNodePosition.y}%`} 
                x2={`${personX}%`} 
                y2={`${personY}%`} 
                stroke="rgba(236, 72, 153, 0.5)" 
                strokeWidth="1.5" 
                strokeDasharray="5 3"
              />
            </svg>
            
            {/* Person node */}
            <div
              className="absolute z-10 bg-pink-50 border border-pink-300 text-gray-800 
                         rounded-lg shadow-sm px-2 py-1 text-xs"
              style={{
                left: `${personX}%`,
                top: `${personY}%`,
                width: `${nodeWidth}px`,
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}
            >
              {person}
            </div>
          </div>
        );
      })}
      
      {/* Circle indicator for additional/back people - only show if needed */}
      {hasExtra && (() => {
        const extraAngle = startAngle + arcSpan;
        const extraX = centerX + outerRadius * Math.cos(extraAngle);
        const extraY = centerY + outerRadius * Math.sin(extraAngle);
        
        return (
          <div>
            {/* Connector line */}
            <svg style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none', 
              zIndex: 5 
            }}>
              <line 
                x1={`${mainNodePosition.x}%`} 
                y1={`${mainNodePosition.y}%`} 
                x2={`${extraX}%`} 
                y2={`${extraY}%`} 
                stroke="rgba(236, 72, 153, 0.5)" 
                strokeWidth="1.5" 
                strokeDasharray="5 3"
              />
            </svg>
            
            {/* Circle node with count - clickable to toggle visibility */}
            <div
              className="absolute z-10 bg-pink-50 border border-pink-300 text-gray-800 
                         flex items-center justify-center rounded-full shadow-sm cursor-pointer
                         hover:bg-pink-100 transition-colors"
              style={{
                left: `${extraX}%`,
                top: `${extraY}%`,
                width: '28px',
                height: '28px',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setShowingMorePeople(!showingMorePeople)}
            >
              {showingMorePeople ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                <span className="text-xs font-medium">+{extraCount}</span>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}

// Generic SubNodes component for all categories
function SubNodes({ category, items, mainNodePosition, containerSize }) {
  const [showingExtraItems, setShowingExtraItems] = useState(false);
  
  if (!items || items.length === 0) return null;
  
  // Constants
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 45; // Beyond main nodes
  const maxVisible = 3;
  
  // Check if we need to group items
  const needsGrouping = items.length > maxVisible;
  
  // Choose which items to show based on current toggle state
  const visibleItems = showingExtraItems 
    ? items.slice(maxVisible) 
    : items.slice(0, maxVisible);
  
  // Get the angle of the parent node
  const mainNodeAngle = Math.atan2(
    mainNodePosition.y - centerY, 
    mainNodePosition.x - centerX
  );
  
  // Calculate arc parameters for positioning
  const arcSpan = Math.PI / 6; // 30 degrees
  const startAngle = mainNodeAngle - (arcSpan / 2);
  
  // Get color based on category
  const getCategoryColor = (cat) => {
    switch(cat) {
      case "Relationships": return { 
        bg: "bg-pink-50", 
        border: "border-pink-300",
        connector: "rgba(236, 72, 153, 0.5)"
      };
      case "Work": return { 
        bg: "bg-blue-50", 
        border: "border-blue-300",
        connector: "rgba(59, 130, 246, 0.5)"
      };
      case "Health": return { 
        bg: "bg-green-50", 
        border: "border-green-300",
        connector: "rgba(16, 185, 129, 0.5)"
      };
      case "Hobbies": return { 
        bg: "bg-yellow-50", 
        border: "border-yellow-300",
        connector: "rgba(245, 158, 11, 0.5)"
      };
      case "Finance": return { 
        bg: "bg-purple-50", 
        border: "border-purple-300",
        connector: "rgba(139, 92, 246, 0.5)"
      };
      case "Growth": return { 
        bg: "bg-orange-50", 
        border: "border-orange-300",
        connector: "rgba(249, 115, 22, 0.5)"
      };
      case "Home": return { 
        bg: "bg-red-50", 
        border: "border-red-300",
        connector: "rgba(239, 68, 68, 0.5)"
      };
      default: return { 
        bg: "bg-gray-50", 
        border: "border-gray-300",
        connector: "rgba(107, 114, 128, 0.5)"
      };
    }
  };
  
  const colors = getCategoryColor(category);
  
  // Responsive node size
  const nodeWidth = containerSize < 640 ? 70 : 80;
  const nodeHeight = containerSize < 640 ? 35 : 40;
  
  return (
    <>
      {/* Render visible subnodes */}
      {visibleItems.map((item, idx) => {
        const totalItems = visibleItems.length || 1;
        const angleStep = arcSpan / totalItems;
        const angle = startAngle + (idx * angleStep);
        
        // Calculate position
        const itemX = centerX + outerRadius * Math.cos(angle);
        const itemY = centerY + outerRadius * Math.sin(angle);
        
        // Generate unique key for React
        const nodeKey = `${category}-${item}-${showingExtraItems ? 'extra' : 'main'}-${idx}`;
        
        return (
          <div key={nodeKey}>
            {/* Connector line */}
            <svg style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none', 
              zIndex: 5 
            }}>
              <line 
                x1={`${mainNodePosition.x}%`} 
                y1={`${mainNodePosition.y}%`} 
                x2={`${itemX}%`} 
                y2={`${itemY}%`} 
                stroke={colors.connector} 
                strokeWidth="1.5" 
                strokeDasharray="5 3"
              />
            </svg>
            
            {/* Item node */}
            <div
              className={`absolute z-10 ${colors.bg} ${colors.border} border text-gray-800 
                          flex items-center justify-center rounded-2xl shadow-sm`}
              style={{
                left: `${itemX}%`,
                top: `${itemY}%`,
                width: `${nodeWidth}px`,
                height: `${nodeHeight}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-xs font-medium text-center px-2">
                {typeof item === 'string' ? item : String(item)}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Toggle button for extra items */}
      {needsGrouping && (() => {
        // Position at the end of the arc
        const buttonAngle = startAngle + arcSpan;
        const buttonX = centerX + outerRadius * Math.cos(buttonAngle);
        const buttonY = centerY + outerRadius * Math.sin(buttonAngle);
        
        return (
          <div>
            {/* Connector line */}
            <svg style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none', 
              zIndex: 5 
            }}>
              <line 
                x1={`${mainNodePosition.x}%`} 
                y1={`${mainNodePosition.y}%`} 
                x2={`${buttonX}%`} 
                y2={`${buttonY}%`} 
                stroke={colors.connector} 
                strokeWidth="1.5" 
                strokeDasharray="5 3"
              />
            </svg>
            
            {/* Circle button - more/back */}
            <div
              key={`toggle-${category}-${showingExtraItems ? 'back' : 'more'}`}
              className={`absolute z-10 ${colors.bg} ${colors.border} border text-gray-800 
                         flex items-center justify-center rounded-full shadow-sm cursor-pointer 
                         hover:opacity-90 transition-transform duration-200 hover:scale-105`}
              style={{
                left: `${buttonX}%`,
                top: `${buttonY}%`,
                width: '30px',
                height: '30px',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => setShowingExtraItems(!showingExtraItems)}
            >
              {showingExtraItems ? (
                // Back arrow when showing extra items
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              ) : (
                // Just the number with no "more" text
                <span className="text-xs font-medium">
                  +{items.length - maxVisible}
                </span>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}

// Reminder Component with drag-and-drop and priority
function Reminder({ text, onDelete, isComplete, onToggleComplete, category, reminder = {}, onDragStart }) {
  const getPriorityColor = (priority = 'medium') => {
    switch(priority) {
      case 'high': return 'bg-red-100 border-red-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-100 border-green-300';
      default: return '';
    }
  };
  // Ensure safe access to reminder properties with defaults
  const priority = reminder.priority || 'medium';
  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-md text-sm border border-gray-200 group ${getPriorityColor(priority)}`}
      draggable="true"
      onDragStart={(e) => onDragStart && onDragStart(e, reminder, category)}
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleComplete}
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${isComplete ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
        >
          {isComplete && <Check className="w-3 h-3 text-white" />}
        </button>
        <span className={isComplete ? 'line-through text-gray-400' : ''}>
          {text}
          {priority === 'high' && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">!</span>
          )}
        </span>
      </div>
      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// New Reminder Form with priority
function AddReminderForm({ onAdd, onCancel }) {
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd({ text, date, priority });
      setText('');
      setDate('');
      setPriority('medium');
    }
  };
  return (
    <div className="space-y-3 bg-white p-3 rounded-lg shadow-sm border">
      <input 
        type="text" 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="What do you need to do?"
        className="w-full p-2 border rounded text-sm"
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="flex-grow p-2 border rounded text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm">Priority:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setPriority('low')}
              className={`px-2 py-1 text-xs rounded ${
                priority === 'low' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Low
            </button>
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`px-2 py-1 text-xs rounded ${
                priority === 'medium' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setPriority('high')}
              className={`px-2 py-1 text-xs rounded ${
                priority === 'high' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleSubmit}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
        <button 
          onClick={onCancel}
          className="px-3 py-2 border border-gray-300 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Main App Component
export default function LifeAreasApp() {
  // App title
  const appTitle = "Life Areas Management";
  
  // Container reference for responsive calculations
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Color themes for categories
  const themeColors = {
    Work: "bg-blue-100 border-blue-500",
    Health: "bg-green-100 border-green-500",
    Relationships: "bg-pink-100 border-pink-500",
    Hobbies: "bg-yellow-100 border-yellow-500",
    Finance: "bg-purple-100 border-purple-500",
    Growth: "bg-orange-100 border-orange-500",
    Home: "bg-red-100 border-red-500"
  };
  
  // State hooks
  const [activeArea, setActiveArea] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [relationshipPeople, setRelationshipPeople] = useState([]);
  const [nodePositions, setNodePositions] = useState({});
  const [showAddReminderForm, setShowAddReminderForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  
  // Sample data for other subnodes (in a real app, this would come from your data service)
  const [categorySubnodes, setCategorySubnodes] = useState({
    Work: ["Project A", "Project B", "Project C", "Meeting X", "Client Y", "Task Z"],
    Health: ["Exercise", "Diet", "Sleep", "Meditation"],
    Relationships: [], // This will be filled by relationshipPeople
    Hobbies: ["Guitar", "Painting", "Reading", "Photography", "Hiking", "Cooking"],
    Finance: ["Budget", "Investments", "Savings", "Bills"],
    Growth: ["Course A", "Book B", "Skill C", "Language D"],
    Home: ["Cleaning", "Renovation", "Garden", "Maintenance"]
  });
  
  // Reminders data by category
  const [reminders, setReminders] = useState({
    Work: [
      { id: 1, text: "Team meeting at 10am", date: "2025-05-15", completed: false, categoryId: "Work", priority: "medium" },
      { id: 2, text: "Submit monthly report", date: "2025-05-18", completed: true, categoryId: "Work", priority: "high" }
    ],
    Health: [
      { id: 3, text: "Yoga class at 6pm", date: "2025-05-13", completed: false, categoryId: "Health", priority: "low" },
      { id: 4, text: "Take vitamins", date: "2025-05-12", completed: false, categoryId: "Health", priority: "medium" }
    ],
    Relationships: [
      { id: 5, text: "Call mom", date: "2025-05-14", completed: false, categoryId: "Relationships", priority: "medium" },
      { id: 6, text: "Date night on Friday", date: "2025-05-17", completed: false, categoryId: "Relationships", priority: "high" }
    ],
    Hobbies: [
      { id: 7, text: "Guitar practice", date: "2025-05-12", completed: true, categoryId: "Hobbies", priority: "low" },
      { id: 8, text: "Paint landscape", date: "2025-05-16", completed: false, categoryId: "Hobbies", priority: "medium" }
    ],
    Finance: [
      { id: 9, text: "Pay electricity bill", date: "2025-05-15", completed: false, categoryId: "Finance", priority: "high" },
      { id: 10, text: "Check budget", date: "2025-05-20", completed: false, categoryId: "Finance", priority: "medium" }
    ],
    Growth: [
      { id: 11, text: "Read 10 pages", date: "2025-05-12", completed: true, categoryId: "Growth", priority: "medium" },
      { id: 12, text: "Watch TED talk", date: "2025-05-13", completed: false, categoryId: "Growth", priority: "low" }
    ],
    Home: [
      { id: 13, text: "Do laundry", date: "2025-05-12", completed: false, categoryId: "Home", priority: "medium" },
      { id: 14, text: "Fix kitchen faucet", date: "2025-05-19", completed: false, categoryId: "Home", priority: "high" }
    ]
  });
  
  // Get relationships data on component mount and calculate node positions
  useEffect(() => {
    dataService.getRelationships().then((data) => {
      setRelationshipPeople(data);
      
      // Update the category subnodes with the relationship people
      setCategorySubnodes(prev => ({
        ...prev,
        Relationships: data
      }));
    });
    
    // Calculate positions of all main nodes
    calculateNodePositions();
    
    // Initial update of container size
    updateContainerSize();
  }, []);
  
  // Calculate positions of all main nodes
  const calculateNodePositions = () => {
    const positions = {};
    
    Object.keys(themeColors).forEach((label, i) => {
      const angle = (360 / Object.keys(themeColors).length) * i * (Math.PI / 180);
      const x = 50 + 38 * Math.cos(angle); // Using percentages
      const y = 50 + 38 * Math.sin(angle);
      
      positions[label] = { x, y };
    });
    
    setNodePositions(positions);
  };
  
  // Update container size for responsive calculations
  const updateContainerSize = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerSize(width);
      setIsMobile(window.innerWidth < 768);
    }
  };
  
  // Add resize listener for responsiveness
  useEffect(() => {
    function handleResize() {
      updateContainerSize();
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Function to handle task drag start
  const handleDragStart = (e, task, category) => {
    setIsDragging(true);
    setDraggedTask({
      task,
      sourceCategory: category
    });
  };
  
  // Function to handle drag over category
  const handleDragOver = (e, category) => {
    e.preventDefault();
    setHoveredCategory(category);
  };
  
  // Function to handle drop on category
  const handleDrop = (e, targetCategory) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.sourceCategory !== targetCategory) {
      // Remove task from source category
      const updatedReminders = {
        ...reminders
      };
      
      const taskToMove = updatedReminders[draggedTask.sourceCategory].find(
        t => t.id === draggedTask.task.id
      );
      
      if (taskToMove) {
        // Remove from source
        updatedReminders[draggedTask.sourceCategory] = updatedReminders[draggedTask.sourceCategory]
          .filter(t => t.id !== draggedTask.task.id);
        
        // Add to target
        updatedReminders[targetCategory] = [
          ...updatedReminders[targetCategory],
          { ...taskToMove, categoryId: targetCategory }
        ];
        
        // Update state
        setReminders(updatedReminders);
      }
    }
    
    // Reset drag state
    setIsDragging(false);
    setDraggedTask(null);
    setHoveredCategory(null);
  };
  
  // Handle node click
  const handleNodeClick = (label, position) => {
    setPopupPosition(position);
    setActiveArea(activeArea === label ? null : label);
    setShowAddReminderForm(false);
  };
  
  const handleAddPerson = async () => {
    const name = prompt("Enter the name of the person:");
    if (name) {
      const res = await dataService.addRelationship(name);
      setRelationshipPeople(res.people);
      
      // Also update in the categorySubnodes
      setCategorySubnodes(prev => ({
        ...prev,
        Relationships: res.people
      }));
    }
  };
  
  const handleAddReminder = (reminder) => {
    if (activeArea) {
      const newReminder = {
        id: Date.now(),
        text: reminder.text,
        date: reminder.date,
        completed: false,
        categoryId: activeArea,
        priority: reminder.priority || 'medium'
      };
      
      setReminders({
        ...reminders,
        [activeArea]: [...(reminders[activeArea] || []), newReminder]
      });
      
      setShowAddReminderForm(false);
    }
  };
  
  const handleDeleteReminder = (area, id) => {
    setReminders({
      ...reminders,
      [area]: reminders[area].filter(r => r.id !== id)
    });
  };
  
  const handleToggleComplete = (area, id) => {
    setReminders({
      ...reminders,
      [area]: reminders[area].map(r => 
        r.id === id ? { ...r, completed: !r.completed } : r
      )
    });
  };
  
  // Function to create background connections between life areas
  const renderConnections = () => {
    const connections = [
      { from: "Work", to: "Finance" },
      { from: "Health", to: "Relationships" },
      { from: "Hobbies", to: "Growth" },
      { from: "Relationships", to: "Home" },
      { from: "Finance", to: "Home" },
      { from: "Growth", to: "Work" }
    ];
    
    return connections.map((connection, index) => {
      const fromIndex = Object.keys(themeColors).indexOf(connection.from);
      const toIndex = Object.keys(themeColors).indexOf(connection.to);
      
      if (fromIndex === -1 || toIndex === -1) return null;
      
      const fromAngle = (360 / Object.keys(themeColors).length) * fromIndex * (Math.PI / 180);
      const toAngle = (360 / Object.keys(themeColors).length) * toIndex * (Math.PI / 180);
      
      const fromX = 50 + 38 * Math.cos(fromAngle);
      const fromY = 50 + 38 * Math.sin(fromAngle);
      const toX = 50 + 38 * Math.cos(toAngle);
      const toY = 50 + 38 * Math.sin(toAngle);
      
      const color = index % 2 === 0 ? "rgba(147, 197, 253, 0.3)" : "rgba(167, 243, 208, 0.3)";
      
      return (
        <path
          key={`connection-${index}`}
          d={`M ${fromX}% ${fromY}% Q 50% 50%, ${toX}% ${toY}%`}
          fill="none"
          stroke={color}
          strokeWidth="10%"
          opacity="0.5"
          strokeLinecap="round"
        />
      );
    });
  };
  
  // Calculate scale factor for different container sizes
  const getScaleFactor = () => {
    if (isMobile) {
      return 0.8; // Scale down on mobile
    }
    return 1;
  };
  
  // Render the app
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-50 p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-blue-600 text-center">{appTitle}</h1>
      
      <div 
        ref={containerRef}
        className="relative mx-auto w-full max-w-5xl aspect-square md:aspect-[5/4] lg:aspect-square"
        style={{ minHeight: "280px" }}
      >
        {/* Background for the entire diagram */}
        <div className="absolute inset-0 bg-white rounded-xl shadow-lg"></div>
        
        {/* Background connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {renderConnections()}
        </svg>
        
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {Object.keys(nodePositions).map((label, i) => {
            const pos = nodePositions[label];
            
            return (
              <line
                key={`line-${label}`}
                x1="50%"
                y1="50%"
                x2={`${pos.x}%`}
                y2={`${pos.y}%`}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
            );
          })}
        </svg>
        
        {/* Center "Sam" circle */}
        <div 
          className="absolute z-10 bg-blue-600 text-white flex items-center justify-center rounded-full shadow-lg text-lg md:text-xl font-medium"
          style={{ 
            left: '50%',
            top: '50%',
            width: isMobile ? '80px' : '120px',
            height: isMobile ? '80px' : '120px',
            transform: 'translate(-50%, -50%)'
          }}
        >
          Sam
        </div>
        
        {/* Life Areas */}
        {Object.keys(themeColors).map((label, i) => {
          const angle = (360 / Object.keys(themeColors).length) * i;
          const nodeClass = themeColors[label] || '';
          
          return (
            <div key={label}>
              <LifeArea
                label={label}
                angle={angle}
                colorClass={`${nodeClass} ${hoveredCategory === label ? 'ring-2 ring-blue-500' : ''}`}
                onClick={handleNodeClick}
                onAddPerson={label === "Relationships" ? handleAddPerson : null}
                onDragOver={(e) => handleDragOver(e, label)}
                onDrop={(e) => handleDrop(e, label)}
                scale={getScaleFactor()}
              />
            </div>
          );
        })}
        
        {/* Render subnodes for each category */}
        {Object.keys(themeColors).map(category => {
          if (nodePositions[category] && categorySubnodes[category] && categorySubnodes[category].length > 0) {
            if (category === "Relationships" && relationshipPeople.length > 0) {
              return (
                <PeopleNodes
                  key={`people-nodes-${category}`}
                  people={relationshipPeople}
                  mainNodePosition={nodePositions[category]}
                  containerSize={containerSize}
                />
              );
            } else {
              return (
                <SubNodes
                  key={`subnodes-${category}`}
                  category={category}
                  items={categorySubnodes[category]}
                  mainNodePosition={nodePositions[category]}
                  containerSize={containerSize}
                />
              );
            }
          }
          return null;
        })}
        
        {/* Popup for active area */}
        {activeArea && (
          <div
            className={`absolute rounded-xl shadow-xl p-3 z-20 ${isMobile ? 'w-[85vw] max-w-[350px]' : 'w-[300px]'} ${activeArea in themeColors ? themeColors[activeArea] : ''}`}
            style={{ 
              left: isMobile ? '50%' : `${Math.max(5, Math.min(popupPosition.x, 95))}%`, 
              top: isMobile ? 'auto' : `${Math.max(5, Math.min(popupPosition.y, 95))}%`,
              bottom: isMobile ? '20px' : 'auto',
              transform: isMobile ? 'translateX(-50%)' : 'translate(-50%, -50%)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{activeArea}</h3>
              <button 
                className="text-gray-500 hover:text-gray-800" 
                onClick={() => setActiveArea(null)}
              >
                ✕
              </button>
            </div>
            
            {showAddReminderForm ? (
              <AddReminderForm 
                onAdd={handleAddReminder} 
                onCancel={() => setShowAddReminderForm(false)}
              />
            ) : (
              <div className="space-y-2 mb-4">
                <button 
                  className="flex items-center space-x-2 text-blue-700 hover:underline"
                  onClick={() => setShowAddReminderForm(true)}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Reminder</span>
                </button>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto">
              {reminders[activeArea] && reminders[activeArea].length > 0 ? (
                <ul className="space-y-2">
                  {reminders[activeArea].map((reminder) => (
                    <li key={reminder.id}>
                      <Reminder 
                        text={reminder.text}
                        reminder={reminder}
                        isComplete={reminder.completed}
                        category={activeArea}
                        onToggleComplete={() => handleToggleComplete(activeArea, reminder.id)}
                        onDelete={() => handleDeleteReminder(activeArea, reminder.id)}
                        onDragStart={handleDragStart}
                      />
                      {reminder.date && (
                        <div className="ml-7 text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(reminder.date).toLocaleDateString()}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No reminders yet
                </div>
              )}
              
              {activeArea === "Relationships" && relationshipPeople.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">People</h4>
                  <ul className="space-y-2">
                    {relationshipPeople.map((person, idx) => (
                      <li key={`person-${idx}`} className="bg-white p-2 rounded-md text-sm border border-gray-200 flex justify-between items-center">
                        <span>👤 {person}</span>
                        <button 
                          className="text-red-500 opacity-0 hover:opacity-100 focus:opacity-100"
                          onClick={() => {
                            const updatedPeople = relationshipPeople.filter(p => p !== person);
                            setRelationshipPeople(updatedPeople);
                            setCategorySubnodes(prev => ({
                              ...prev,
                              Relationships: updatedPeople
                            }));
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center text-gray-500 mt-6 text-sm">
        Click on any life area to view and manage tasks
      </div>
    </div>
  );
}
