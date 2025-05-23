import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ScrollView
} from 'react-native';
import { 
  Edit2, 
  Trash2, 
  FileText, 
  Video, 
  File, 
  Image as ImageIcon,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const LessonList = ({ 
  lessons, 
  onLessonPress, 
  onEditPress, 
  onDeletePress,
  isReorderMode = false,
  isFacilitator = false
}) => {
  
  // Get icon based on lesson type
  const getLessonIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video size={20} color={COLORS.primary} />;
      case 'pdf':
        return <File size={20} color={COLORS.primary} />;
      case 'image':
        return <ImageIcon size={20} color={COLORS.primary} />;
      default:
        return <FileText size={20} color={COLORS.primary} />;
    }
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.lessonItem,
        !item.is_published && styles.unpublishedItem
      ]}
      onPress={() => onLessonPress(item)}
      disabled={isReorderMode}
    >
      <View style={styles.lessonIconContainer}>
        {getLessonIcon(item.lesson_type)}
      </View>
      
      <View style={styles.lessonContent}>
        <Text style={styles.lessonTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {/* Always show status tag (Published or Draft) */}
        <View style={[styles.statusTag, item.is_published ? styles.publishedTag : styles.unpublishedTag]}>
          {item.is_published ? (
            <Eye size={12} color="#FFF" />
          ) : (
            <EyeOff size={12} color="#FFF" />
          )}
          <Text style={styles.statusText}>
            {item.is_published ? 'Published' : 'Draft'}
          </Text>
        </View>
      </View>
      
      {isFacilitator && !isReorderMode && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEditPress(item)}
          >
            <Edit2 size={18} color={COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { marginLeft: 8 }]}
            onPress={() => onDeletePress(item)}
          >
            <Trash2 size={18} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      )}
      
      {!isReorderMode && (
        <ChevronRight size={16} color={COLORS.lightText} />
      )}
    </TouchableOpacity>
  );
  
  // Show empty state if no lessons
  if (lessons.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FileText size={40} color={COLORS.lightText} />
        <Text style={styles.emptyText}>No lessons yet</Text>
      </View>
    );
  }
  
  // Use manual rendering instead of FlatList to avoid nesting VirtualizedLists
  return (
    <View style={styles.listContainer}>
      {lessons.map(item => (
        <TouchableOpacity
          key={item.id.toString()}
          style={[
            styles.lessonItem,
            !item.is_published && styles.unpublishedItem
          ]}
          onPress={() => onLessonPress(item)}
          disabled={isReorderMode}
        >
          <View style={styles.lessonIconContainer}>
            {getLessonIcon(item.lesson_type)}
          </View>
          
          <View style={styles.lessonContent}>
            <Text style={styles.lessonTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {/* Always show status tag (Published or Draft) */}
            <View style={[styles.statusTag, item.is_published ? styles.publishedTag : styles.unpublishedTag]}>
              {item.is_published ? (
                <Eye size={12} color="#FFF" />
              ) : (
                <EyeOff size={12} color="#FFF" />
              )}
              <Text style={styles.statusText}>
                {item.is_published ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
          
          {isFacilitator && !isReorderMode && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEditPress(item)}
              >
                <Edit2 size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDeletePress(item)}
              >
                <Trash2 size={18} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
          )}
          
          {!isReorderMode && (
            <ChevronRight size={16} color={COLORS.lightText} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unpublishedItem: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.lightText,
    opacity: 0.8,
  },
  lessonIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 12,
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  publishedTag: {
    backgroundColor: COLORS.primary,
  },
  unpublishedTag: {
    backgroundColor: COLORS.lightText,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 2,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    padding: 5,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});

export default LessonList;
